<?php

namespace App\Http\Controllers;

use App\Models\ResearchPaper;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResearchPaperController extends Controller
{

    public function store(Request $request)
    {
        $request->validate([
            'title'         => 'required|string|max:255',
            'abstract'      => 'required|string|min:100',
            'file'          => 'required|mimes:pdf|max:51200',
            'document_type' => 'required|in:thesis,capstone,journal,article',
        ]);

        $user = Auth::user();
        $student = $user->student;

        $activeYear = AcademicYear::active();

        if (!$activeYear) {
            return response()->json([
                'message' => 'No active academic year configured.'
            ], 500);
        }

        $filePath = $request->file('file')->store('research_papers', 'public');

        $referenceNumber = 'RP-' . date('Y') . '-' . strtoupper(Str::random(6));

        $research = ResearchPaper::create([
            'reference_number' => $referenceNumber,
            'school_id'        => $user->school_id,
            'student_id'       => $student->student_id,
            'program_id'       => $student->program_id,
            'academic_year_id' => $activeYear->academic_year_id,
            'title'            => $request->title,
            'abstract'         => $request->abstract,
            'document_type'    => $request->document_type,
            'similarity_percentage' => null,
            'pdf_path'         => $filePath,
            'status'           => 'pending',
            'approved_at'      => null,
        ]);

        return response()->json([
            'message' => 'Research uploaded successfully',
            'data'    => $research
        ], 201);
    }

}