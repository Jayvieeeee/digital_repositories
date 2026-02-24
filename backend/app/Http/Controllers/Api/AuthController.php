<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Student;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendResetCodeMail;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with('school')
                    ->where('email', $request->email)
                    ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Account not found.'],
            ]);
        }

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Incorrect password.'],
            ]);
        }

        // Student must be active
        if ($user->role === 'student' && $user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Your student account is not activated yet.'],
            ]);
        }

        // School must be approved
        if ($user->role === 'school' &&
            (!$user->school || $user->school->status !== 'approved')) {

            throw ValidationException::withMessages([
                'email' => ['Your institution is not approved yet.'],
            ]);
        }

        return response()->json([
            'token' => $user->createToken('api-token')->plainTextToken,
            'user'  => new UserResource($user),
        ]);
    }


    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Logout user 
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Register new user
     */

    public function registerStudent(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role'       => 'required|string',
            'school_id'  => 'required|exists:schools,school_id',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'school_id' => $request->school_id,
            'status' => 'pending', // Default status
        ]);

        Student::create([
        'user_id'    => $user->user_id,
        'status' => 'pending', // Default status
    ]);

        return response()->json([
            'token' => $user->createToken('api-token')->plainTextToken,
            'user' => new UserResource($user) 
        ], 201);
    }

    /**
     * Register new school
     */
    public function registerInstitution(Request $request)
    {
        $request->validate([
            // School
            'schoolName'        => 'required|string|max:255',
            'schoolAddress'     => 'required|string|max:255',
            'schoolType'        => 'required|string|max:255',
            'contactNumber'     => 'required|string|max:11',

            // Librarian
            'librarianFirstName'=> 'required|string|max:255',
            'librarianLastName' => 'required|string|max:255',
            'password'          => 'required|min:8|confirmed',

            'email' => 'required|email|unique:users,email',

            // File
            'certification_file'=> 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        DB::beginTransaction();

        try {

            // Store certification file
            $proofPath = $request->file('certification_file')->store('proofs', 'public');

            // Create School
            $school = School::create([
                'school_name'        => $request->schoolName,
                'school_address'     => $request->schoolAddress,
                'school_type'        => $request->schoolType,
                'contact_number'     => $request->contactNumber,
                'email'              => $request->email,
                'proof_of_legitimacy'=> $proofPath,
                'status'             => 'pending',
            ]);

            // Create Librarian
            $user = User::create([
                'first_name' => $request->librarianFirstName,
                'last_name'  => $request->librarianLastName,
                'password'   => Hash::make($request->password), 
                'email'      => $request->email,
                'role'       => 'school',
                'status'     => 'pending',
                'school_id'  => $school->school_id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Institution registration submitted. Await admin approval.'
            ], 201);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Registration failed.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Password reset request
     */
    public function sendResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Check for existing code
        $existing = DB::table('password_reset_codes')->where('email', $user->email)->first();

        if ($existing) {

            $cooldownUntil = Carbon::parse($existing->updated_at)->addSeconds(60);

            if (Carbon::now()->lt($cooldownUntil)) {
                return response()->json([
                    'message' => 'You can request a new code after 1 minute.'
                ], 429);
            }
        }


        // Generate 6-digit OTP
        $code = rand(100000, 999999);

        // Save or update OTP
        DB::table('password_reset_codes')->updateOrInsert(
            ['email' => $user->email],
            [
                'code' => $code,
                'expires_at' => Carbon::now()->addMinutes(10),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        // Queue the email for faster response
        Mail::to($user->email)->queue(new SendResetCodeMail($code));

        return response()->json([
            'message' => 'Reset code sent successfully.'
        ]);
    }

    /**
     * Verify reset quest sent
     */
    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|digits:6',
        ]);

        $record = DB::table('password_reset_codes')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid code'], 400);
        }

        if (Carbon::now()->gt($record->expires_at)) {
            return response()->json(['message' => 'Code expired'], 400);
        }

        return response()->json([
            'message' => 'Code verified successfully.'
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|digits:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_codes')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$record) return response()->json(['message' => 'Invalid code'], 400);
        if (Carbon::now()->gt($record->expires_at)) return response()->json(['message' => 'Code expired'], 400);

        $user = User::where('email', $request->email)->first();

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Delete OTP after successful reset
        DB::table('password_reset_codes')
            ->where('email', $request->email)
            ->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }

}