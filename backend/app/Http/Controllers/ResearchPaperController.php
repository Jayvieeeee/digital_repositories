<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ResearchPaper;
use App\Models\AcademicYear;
use App\Models\SimilarityResult;
use App\Services\SimilarityService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ResearchPaperController extends Controller
{
    protected $similarityService;

    public function __construct(SimilarityService $similarityService)
    {
        $this->similarityService = $similarityService;
    }

    /**
     * Display a listing of research papers
     */
    public function index(Request $request)
    {
        try {
            $query = ResearchPaper::with([
                'student.user', 
                'student.program',  
                'program', 
                'academicYear'
            ]);

            // Apply filters
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhereHas('student.user', function($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                        });
                });
            }

            if ($request->has('program') && !empty($request->program)) {
                $query->whereHas('program', function($q) use ($request) {
                    $q->where('program_id', $request->program)
                    ->orWhere('name', 'like', "%{$request->program}%");
                });
            }

            if ($request->has('year_level') && !empty($request->year_level)) {
                $query->where('year_level', $request->year_level);
            }

            if ($request->has('school_year') && !empty($request->school_year)) {
                $query->whereHas('academicYear', function($q) use ($request) {
                    $q->where('year', $request->school_year);
                });
            }

            if ($request->has('status') && $request->status !== 'all' && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            // Pagination
            $perPage = $request->get('per_page', 10);
            $papers = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // Transform the data to ensure all fields are properly formatted
            $papers->getCollection()->transform(function ($paper) {
                return [
                    'paper_id' => $paper->paper_id,
                    'title' => $paper->title,
                    'keywords' => $paper->keywords,
                    'abstract' => $paper->abstract,
                    'document_type' => $paper->document_type,
                    'status' => $paper->status,
                    'similarity_percentage' => $paper->similarity_percentage,
                    'year_level' => $paper->year_level ?? ($paper->student->year_level ?? null),
                    'date_submitted' => $paper->created_at,
                    'created_at' => $paper->created_at,
                    'program' => $paper->program ? [
                        'program_id' => $paper->program->program_id,
                        'program_name' => $paper->program->program_name ?? $paper->program->name,
                    ] : ($paper->student->program ? [
                        'program_id' => $paper->student->program->program_id,
                        'program_name' => $paper->student->program->program_name ?? $paper->student->program->name,
                    ] : null),
                    'student' => $paper->student ? [
                        'student_id' => $paper->student->student_id,
                        'year_level' => $paper->student->year_level,
                        'user' => $paper->student->user ? [
                            'user_id' => $paper->student->user->user_id,
                            'name' => trim($paper->student->user->first_name . ' ' . $paper->student->user->last_name),
                            'first_name' => $paper->student->user->first_name,
                            'last_name' => $paper->student->user->last_name,
                            'email' => $paper->student->user->email,
                        ] : null,
                    ] : null,
                    'academic_year' => $paper->academicYear ? [
                        'academic_year_id' => $paper->academicYear->academic_year_id,
                        'year' => $paper->academicYear->year,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $papers
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch papers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch papers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

/**
 * Store a newly created research paper
 */
public function store(Request $request)
{
    $request->validate([
        'title' => 'required|string|max:255',
        'keywords' => 'required|string|max:255',
        'abstract' => 'required|string',
        'document_type' => 'required|in:thesis,capstone,journal,article',
        'pdf' => 'required|file|mimes:pdf|max:51200' // Max 50MB
    ]);

    DB::beginTransaction();
    
    try {
        $user = Auth::user();
        if (!$user) throw new \Exception('User not authenticated');

        $student = $user->student;
        if (!$student) throw new \Exception('User has no linked student record');

        $academicYear = AcademicYear::where('is_active', true)->first();
        if (!$academicYear) throw new \Exception('No active academic year found');

        // STORE PDF
        $pdfPath = $request->file('pdf')->store('research_papers', 'local');

        // EXTRACT + CLEAN TEXT - but don't fail if extraction fails
        $rawText = '';
        $cleanText = '';
        $textExtracted = false;
        
        try {
            $rawText = $this->similarityService->extractText($pdfPath);
            $cleanText = $this->similarityService->cleanText($rawText);
            $textExtracted = !empty($cleanText);
        } catch (\Exception $e) {
            Log::warning('PDF text extraction failed but continuing upload: ' . $e->getMessage());
            // Continue with empty text
        }

        // SAVE PAPER
        $researchPaper = ResearchPaper::create([
            'reference_number' => 'REF-' . strtoupper(uniqid()),
            'school_id' => $user->school_id,
            'student_id' => $student->student_id,
            'program_id' => $student->program_id,
            'academic_year_id' => $academicYear->academic_year_id,
            'title' => $request->title,
            'keywords' => $request->keywords,
            'abstract' => $request->abstract,
            'document_type' => $request->document_type,
            'pdf_path' => $pdfPath,
            'raw_text' => $rawText,
            'cleaned_text' => $cleanText,
            'status' => 'pending', // Keep original status
            'similarity_percentage' => 0
        ]);

        // COMPARE WITH EXISTING PAPERS (only if text was extracted)
        $highestSimilarity = 0;
        $mostSimilarPaperId = null;

        if ($textExtracted) {
            try {
                $existingPapers = ResearchPaper::where('school_id', $user->school_id)
                    ->whereNotNull('cleaned_text')
                    ->where('paper_id', '!=', $researchPaper->paper_id)
                    ->get();

                if ($existingPapers->isNotEmpty()) {
                    $comparisonResults = $this->similarityService->comparePapers(
                        $cleanText,
                        $existingPapers,
                        $researchPaper->paper_id
                    );

                    // Save similarity results
                    foreach ($comparisonResults['all_results'] as $result) {
                        SimilarityResult::create([
                            'source_paper_id' => $researchPaper->paper_id,
                            'compared_paper_id' => $result['paper_id'],
                            'similarity_score' => $result['similarity_score'],
                            'checked_at' => now(),
                        ]);
                    }

                    $highestSimilarity = $comparisonResults['highest_similarity'];
                    $mostSimilarPaperId = $comparisonResults['most_similar_paper_id'];
                    
                    // Update paper with similarity
                    $researchPaper->similarity_percentage = $highestSimilarity;
                    
                    // Auto-flag if high similarity (optional)
                    if ($highestSimilarity >= 70) {
                        $researchPaper->status = 'flagged';
                    }
                    
                    $researchPaper->save();
                }
            } catch (\Exception $e) {
                Log::error('Similarity comparison failed: ' . $e->getMessage());
                // Continue - paper already saved
            }
        } else {
            // Just save with 0 similarity
            $researchPaper->save();
        }

        DB::commit();

        $message = $textExtracted 
            ? 'Research paper uploaded successfully with similarity check.'
            : 'Research paper uploaded successfully. (Note: PDF text could not be extracted)';

        return response()->json([
            'message' => $message,
            'similarity_percentage' => $researchPaper->similarity_percentage,
            'data' => $researchPaper,
            'most_similar_paper_id' => $mostSimilarPaperId
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('UPLOAD ERROR: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'message' => 'Upload failed.',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Display the specified research paper
     */
    public function show($id)
    {
        try {
            $paper = ResearchPaper::with([
                'student.user', 
                'program', 
                'academicYear', 
                'similarityResults.comparedPaper'
            ])->findOrFail($id);

            // Transform the paper data to ensure all fields are properly formatted
            $paperData = [
                'paper_id' => $paper->paper_id,
                'title' => $paper->title,
                'keywords' => $paper->keywords, // This will be included
                'abstract' => $paper->abstract,
                'document_type' => $paper->document_type,
                'status' => $paper->status,
                'similarity_percentage' => $paper->similarity_percentage,
                'year_level' => $paper->year_level ?? ($paper->student->year_level ?? null),
                'date_submitted' => $paper->created_at,
                'created_at' => $paper->created_at,
                'program' => $paper->program ? [
                    'program_id' => $paper->program->program_id,
                    'program_name' => $paper->program->program_name ?? $paper->program->name,
                ] : ($paper->student->program ? [
                    'program_id' => $paper->student->program->program_id,
                    'program_name' => $paper->student->program->program_name ?? $paper->student->program->name,
                ] : null),
                'student' => $paper->student ? [
                    'student_id' => $paper->student->student_id,
                    'year_level' => $paper->student->year_level,
                    'user' => $paper->student->user ? [
                        'user_id' => $paper->student->user->user_id,
                        'name' => trim($paper->student->user->first_name . ' ' . $paper->student->user->last_name),
                        'first_name' => $paper->student->user->first_name,
                        'last_name' => $paper->student->user->last_name,
                        'email' => $paper->student->user->email,
                    ] : null,
                ] : null,
                'academic_year' => $paper->academicYear ? [
                    'academic_year_id' => $paper->academicYear->academic_year_id,
                    'year' => $paper->academicYear->year,
                ] : null,
                'similarity_results' => $paper->similarityResults ? $paper->similarityResults->map(function($result) {
                    return [
                        'similarity_result_id' => $result->similarity_result_id,
                        'compared_paper_id' => $result->compared_paper_id,
                        'similarity_score' => $result->similarity_score,
                        'checked_at' => $result->checked_at,
                        'compared_paper' => $result->comparedPaper ? [
                            'paper_id' => $result->comparedPaper->paper_id,
                            'title' => $result->comparedPaper->title,
                            'reference_number' => $result->comparedPaper->reference_number,
                        ] : null,
                    ];
                }) : [],
            ];

            return response()->json([
                'success' => true,
                'data' => $paperData
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch paper: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Paper not found'
            ], 404);
        }
    }

    /**
     * Update the specified research paper
     */
    public function update(Request $request, $id)
    {
        try {
            $paper = ResearchPaper::findOrFail($id);

            $request->validate([
                'title' => 'sometimes|string|max:255',
                'abstract' => 'sometimes|string',
                'status' => 'sometimes|in:pending,approved,rejected,flagged'
            ]);

            $paper->update($request->only(['title', 'abstract', 'status']));

            return response()->json([
                'success' => true,
                'message' => 'Paper updated successfully',
                'data' => $paper
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update paper: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update paper',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified research paper
     */
    public function destroy($id)
    {
        try {
            $paper = ResearchPaper::findOrFail($id);
            
            // Delete PDF file
            if (Storage::disk('local')->exists($paper->pdf_path)) {
                Storage::disk('local')->delete($paper->pdf_path);
            }
            
            // Delete the paper (similarity results will cascade if set up)
            $paper->delete();

            return response()->json([
                'success' => true,
                'message' => 'Paper deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete paper: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete paper',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update paper status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,approved,rejected,flagged'
            ]);

            $paper = ResearchPaper::findOrFail($id);
            $paper->status = $request->status;
            $paper->save();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => $paper
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download paper PDF
     */
    public function download($id)
    {
        try {
            $paper = ResearchPaper::findOrFail($id);
            
            if (!Storage::disk('local')->exists($paper->pdf_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }

            $filePath = storage_path('app/' . $paper->pdf_path);
            return response()->download($filePath, $paper->title . '.pdf');
        } catch (\Exception $e) {
            Log::error('Failed to download paper: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to download paper',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get similarity details for a paper
     */
    public function getSimilarityDetails($id)
    {
        try {
            $paper = ResearchPaper::with(['similarityResults.comparedPaper' => function($query) {
                $query->select('paper_id', 'title', 'reference_number');
            }])->findOrFail($id);

            $similarityResults = $paper->similarityResults()
                ->with('comparedPaper')
                ->orderBy('similarity_score', 'desc')
                ->get()
                ->map(function($result) {
                    return [
                        'compared_paper_id' => $result->compared_paper_id,
                        'compared_paper_title' => $result->comparedPaper->title ?? 'Unknown',
                        'similarity_score' => $result->similarity_score,
                        'checked_at' => $result->checked_at
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'paper_id' => $paper->paper_id,
                    'paper_title' => $paper->title,
                    'overall_similarity' => $paper->similarity_percentage,
                    'matches' => $similarityResults
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch similarity details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch similarity details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get papers by school
     */
    public function getBySchool($schoolId)
    {
        try {
            $papers = ResearchPaper::where('school_id', $schoolId)
                ->with(['student.user', 'program', 'academicYear'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $papers
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch school papers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch papers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}