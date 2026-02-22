<?php

namespace App\Http\Controllers;

use App\Models\ResearchPaper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ResearchPaperController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'title'            => 'required|string|max:255',
            'abstract'         => 'required|string|min:100',
            'keywords'         => 'required|string',
            'file'             => 'required|mimes:pdf|max:51200', // 50MB
            'document_type'    => 'required|in:thesis,capstone,journal,article',
            'adviser_id'       => 'required|exists:advisers,adviser_id',
            'academic_year_id' => 'required|exists:academic_years,academic_year_id',
        ]);

        $user = Auth::user();

        // Upload file
        $filePath = $request->file('file')->store('research_papers', 'public');

        $research = ResearchPaper::create([
            'school_id'          => $user->school_id,
            'student_id'         => $user->student_id, // adjust if needed
            'adviser_id'         => $request->adviser_id,
            'academic_year_id'   => $request->academic_year_id,
            'title'              => $request->title,
            'abstract'           => $request->abstract,
            'document_type'      => $request->document_type,
            'pdf_path'           => $filePath,
            'status'             => 'pending',
        ]);

        return response()->json([
            'message' => 'Research uploaded successfully',
            'data'    => $research
        ], 201);
    }
}