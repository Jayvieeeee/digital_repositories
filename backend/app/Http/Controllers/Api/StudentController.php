<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ResearchPaper;
use App\Models\AccessRequest;

class StudentController extends Controller
{

    /* ======================================
        DASHBOARD
    ====================================== */
    public function dashboardSummary()
    {
        $user = Auth::user();

        $uploads = ResearchPaper::where('student_id', $user->id)->count();

        $requests = AccessRequest::where('student_id', $user->id)->count();

        return response()->json([
            'uploads' => $uploads,
            'requests' => $requests
        ]);
    }


    /* ======================================
        BROWSE + FILTER
    ====================================== */
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


    /* ======================================
        RESEARCH DETAIL + VISIBILITY
    ====================================== */
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


    /* ======================================
        UPLOAD PAPER
    ====================================== */
    public function upload(Request $request)
    {
        $student = Auth::user();

        $request->validate([
            'title' => 'required',
            'abstract' => 'required',
            'document_type' => 'required',
            'year' => 'required|integer',
            'file' => 'required|file|mimes:pdf|max:20480'
        ]);

        DB::beginTransaction();

        try {

            $path = $request->file('file')->store('papers', 'public');

            $paper = ResearchPaper::create([
                'student_id' => $student->id,
                'school_id' => $student->school_id,
                'title' => $request->title,
                'abstract' => $request->abstract,
                'document_type' => $request->document_type,
                'year' => $request->year,
                'file_path' => $path
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Uploaded',
                'paper' => $paper
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /* ======================================
        MY REQUESTS
    ====================================== */
    public function myRequests()
    {
        $student = Auth::user();

        $requests = AccessRequest::with('paper.school')
            ->where('student_id', $student->id)
            ->latest()
            ->get();

        return response()->json($requests);
    }
}
