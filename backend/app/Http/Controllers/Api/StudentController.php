<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ResearchPaper;
use App\Models\AccessRequest;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{

    /*
        DASHBOARD
    */
    public function dashboard()
    {
        $user = Auth::user();

        // Find the student record for this user
        $student = $user->student;

        $uploads = $student 
            ? $student->uploadedPapers()->count() 
            : 0;

        $requests = AccessRequest::where('requesting_user_id', $user->user_id)->count();

        return response()->json([
            'uploads' => $uploads,
            'citations' => 0, // future feature
            'requests' => $requests
        ]);
}

    public function submissionsStatus()
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'pendingReview' => 0,
                'needsRevision' => 0,
                'approved' => 0,
                'rejected' => 0
            ]);
        }

        $pendingReview = $student->uploadedPapers()->where('status', 'pending')->count();
        $needsRevision = $student->uploadedPapers()->where('status', 'revision')->count();
        $approved = $student->uploadedPapers()->where('status', 'approved')->count();
        $rejected = $student->uploadedPapers()->where('status', 'rejected')->count();

        return response()->json([
            'pendingReview' => $pendingReview,
            'needsRevision' => $needsRevision,
            'approved' => $approved,
            'rejected' => $rejected
        ]);
    }

    public function accessRequests()
    {
        $user = Auth::user();

        $requests = AccessRequest::with('paper')
            ->where('requesting_user_id', $user->user_id)
            ->latest()
            ->get();

        return response()->json(
            $requests->map(function ($req) {
                return [
                    'id' => $req->request_id,
                    'title' => $req->paper->title ?? 'Untitled Research',
                    'subject' => $req->paper->subject ?? 'N/A',
                    'requestedDate' => optional($req->request_date ?? $req->created_at)->format('m/d/Y'),
                    'status' => ucfirst($req->status)
                ];
            })
        );
    }


    /* 
        BROWSE + FILTER
     */
    public function browse(Request $request)
    {
        $query = ResearchPaper::with('school');

        if ($request->title) {
            $query->where('title', 'like', "%{$request->title}%");
        }

        if ($request->year) {
            $query->where('year', $request->year);
        }

        if ($request->document_type) {
            $query->where('document_type', $request->document_type);
        }

        return response()->json(
            $query->latest()->paginate(10)
        );
    }


    /* 
        RESEARCH DETAIL + VISIBILITY
    */
    public function show($id)
    {
        $student = Auth::user();

        $paper = ResearchPaper::with('school')->findOrFail($id);

        $sameSchool = $student->school_id === $paper->school_id;

        $approved = AccessRequest::where([
            'student_id' => $student->id,
            'research_paper_id' => $paper->id,
            'status' => 'approved'
        ])->exists();

        return response()->json([
            'paper' => $paper,
            'can_view_full' => $sameSchool || $approved
        ]);
    }

    public function requestAccess(Request $request, $paperId)
    {
        $user = Auth::user();

        $exists = AccessRequest::where([
            'paper_id' => $paperId,
            'requesting_user_id' => $user->id
        ])->exists();

        if ($exists) {
            return response()->json(['message' => 'Already requested'], 400);
        }

        AccessRequest::create([
            'paper_id' => $paperId,
            'requesting_user_id' => $user->id,
            'request_message' => $request->message,
            'status' => 'pending',
            'request_date' => now()
        ]);

        return response()->json(['message' => 'Request sent']);
    }

    /* 
        MY REQUESTS
   */
    public function myRequests()
    {
        $student = Auth::user();

        $requests = AccessRequest::with('paper.school')
            ->where('student_id', $student->id)
            ->latest()
            ->get();

        return response()->json($requests);
    }


    public function profile(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        return response()->json([
            'first_name'  => $user->first_name,
            'last_name'   => $user->last_name,
            'email'       => $user->email,
            'year_level'  => $student->year_level ?? null,
            'school_name' => $user->school->school_name ?? null,
            'program_id'  => $student->program_id ?? null,
            'student_no'  => $student->uploaded_student_id ?? null,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        $user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
        ]);

        $student->update([
            'uploaded_student_id' => $request->student_no,
            'year_level'          => $request->year_level,
            'program_id'          => $request->program_id,
        ]);

        return response()->json(['message' => 'Updated successfully']);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Wrong password'], 400);
        }

        $user->update([
            'password' => bcrypt($request->new_password),
        ]);

        return response()->json(['message' => 'Password updated']);
    }

}
