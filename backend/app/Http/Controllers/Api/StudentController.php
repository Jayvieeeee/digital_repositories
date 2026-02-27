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

        // FIXED: Use researchPapers() instead of uploadedPapers()
        $uploads = $student
            ? $student->researchPapers()->count()
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

        // FIXED: Use researchPapers() instead of uploadedPapers()
        $pendingReview = $student->researchPapers()->where('status', 'pending')->count();
        $needsRevision = $student->researchPapers()->where('status', 'needs_revision')->count(); // Fixed: 'revision' to 'needs_revision' (common convention)
        $approved = $student->researchPapers()->where('status', 'approved')->count();
        $rejected = $student->researchPapers()->where('status', 'rejected')->count();

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
            $query->whereYear('created_at', $request->year); // Fixed: 'year' to created_at year
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
        $user = Auth::user(); // Fixed: $student to $user
        $student = $user->student;

        $paper = ResearchPaper::with('school')->findOrFail($id);

        $sameSchool = $user->school_id === $paper->school_id; // Fixed: using user.school_id

        // FIXED: Check access request properly
        $approved = AccessRequest::where([
            'requesting_user_id' => $user->user_id, // Fixed: using correct field names
            'paper_id' => $paper->paper_id,
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

        $paper = ResearchPaper::findOrFail($paperId);

        // Optional: still good practice
        if ($paper->school_id === $user->school_id) {
            return response()->json(['message' => 'Same school access is automatic.'], 403);
        }

        AccessRequest::create([
            'paper_id' => $paper->paper_id,
            'academic_year_id' => $paper->academic_year_id,
            'requesting_user_id' => $user->user_id,
            'request_message' => $request->message,
            'status' => 'pending',
            'request_date' => now()
        ]);

        return response()->json(['message' => 'Request sent successfully']);
    }

    /* 
        MY REQUESTS
    */
    public function myRequests()
    {
        $user = Auth::user(); // Fixed: $student to $user

        $requests = AccessRequest::with('paper.school')
            ->where('requesting_user_id', $user->user_id) // Fixed: student_id to requesting_user_id
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
            'school_name' => $user->school->name ?? null, // Fixed: school_name to name (check your actual column)
            'program_id'  => $student->program_id ?? null,
            'program_name' => $student->program->name ?? null, // Added program name
            'student_no'  => $student->uploaded_student_id ?? null,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->user_id . ',user_id',
            'student_no' => 'nullable|string',
            'year_level' => 'nullable|integer|min:1|max:5',
            'program_id' => 'nullable|exists:programs,program_id'
        ]);

        $user->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
        ]);

        if ($student) {
            $student->update([
                'uploaded_student_id' => $request->student_no,
                'year_level'          => $request->year_level,
                'program_id'          => $request->program_id,
            ]);
        }

        return response()->json(['message' => 'Profile updated successfully']);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed'
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Get recent uploads for student dashboard
     */
    public function recentUploads()
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json([]);
        }

        $recent = $student->researchPapers()
            ->with('program')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($paper) {
                return [
                    'id' => $paper->paper_id,
                    'title' => $paper->title,
                    'status' => $paper->status,
                    'similarity' => $paper->similarity_percentage,
                    'submitted_at' => $paper->created_at->diffForHumans()
                ];
            });

        return response()->json($recent);
    }

    /**
     * Get statistics for student dashboard
     */
    public function statistics()
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json([
                'total_uploads' => 0,
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
                'avg_similarity' => 0
            ]);
        }

        $papers = $student->researchPapers();

        return response()->json([
            'total_uploads' => $papers->count(),
            'pending' => $papers->clone()->where('status', 'pending')->count(),
            'approved' => $papers->clone()->where('status', 'approved')->count(),
            'rejected' => $papers->clone()->where('status', 'rejected')->count(),
            'avg_similarity' => round($papers->avg('similarity_percentage') ?? 0, 2)
        ]);
    }
}
