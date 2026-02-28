<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ResearchPaper;
use App\Models\AcademicYear;
use App\Models\SimilarityResult;
use App\Jobs\ProcessSimilarityJob;
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

            $perPage = $request->get('per_page', 10);
            $papers = $query->orderBy('created_at', 'desc')->paginate($perPage);

            $papers->getCollection()->transform(function ($paper) {
                return $this->transformPaper($paper);
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
     * FIXED: Synchronous similarity check so result is immediate
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'         => 'required|string|max:255',
            'keywords'      => 'required|string|max:255',
            'abstract'      => 'required|string',
            'document_type' => 'required|in:thesis,capstone,journal,article',
            'pdf'           => 'required|file|mimes:pdf|max:51200'
        ]);

        DB::beginTransaction();
        
        try {
            $user = Auth::user();
            if (!$user) throw new \Exception('User not authenticated');

            $student = $user->student;
            if (!$student) throw new \Exception('User has no linked student record');

            $academicYear = AcademicYear::where('is_active', true)->first();
            if (!$academicYear) throw new \Exception('No active academic year found');

            // Store PDF
            $pdfPath = $request->file('pdf')->store('research_papers', 'local');

            // Extract text from PDF
            $cleanedText = '';
            $rawText     = '';

            try {
                $rawText     = $this->similarityService->extractText($pdfPath);
                $cleanedText = $rawText; // extractText already cleans the text
                Log::info('Text extracted successfully. Length: ' . strlen($cleanedText));
            } catch (\Exception $e) {
                Log::warning('PDF text extraction failed: ' . $e->getMessage());
            }

            $textExtracted = !empty($cleanedText) && strlen(trim($cleanedText)) >= 50;

            // Save the paper first with cleaned_text
            $researchPaper = ResearchPaper::create([
                'reference_number'    => 'REF-' . strtoupper(uniqid()),
                'school_id'           => $user->school_id,
                'student_id'          => $student->student_id,
                'program_id'          => $student->program_id,
                'academic_year_id'    => $academicYear->academic_year_id,
                'title'               => $request->title,
                'keywords'            => $request->keywords,
                'abstract'            => $request->abstract,
                'document_type'       => $request->document_type,
                'pdf_path'            => $pdfPath,
                'raw_text'            => $rawText,
                'cleaned_text'        => $cleanedText,  // ← CRITICAL: must be saved
                'status'              => 'pending',
                'similarity_percentage' => 0,
            ]);

            Log::info("Paper saved. ID: {$researchPaper->paper_id}, cleaned_text length: " . strlen($cleanedText));

            $highestSimilarity  = 0;
            $mostSimilarPaperId = null;

            if ($textExtracted) {
                // Run similarity check SYNCHRONOUSLY so result shows immediately
                $highestSimilarity = $this->runSimilarityCheck($researchPaper, $cleanedText);
            } else {
                Log::warning("Paper {$researchPaper->paper_id}: text extraction failed or text too short. Skipping similarity.");
            }

            DB::commit();

            $message = $textExtracted
                ? 'Research paper uploaded successfully. Similarity: ' . $highestSimilarity . '%'
                : 'Research paper uploaded. (PDF text could not be extracted — similarity check skipped)';

            return response()->json([
                'message'              => $message,
                'similarity_percentage' => $researchPaper->similarity_percentage,
                'text_extracted'       => $textExtracted,
                'data'                 => $researchPaper,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('UPLOAD ERROR: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'message' => 'Upload failed.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Run similarity check synchronously and save results.
     * Returns the highest similarity percentage found.
     */
    private function runSimilarityCheck(ResearchPaper $paper, string $cleanedText): float
    {
        try {
            // Get all OTHER papers from the same school that have cleaned_text
            $existingPapers = ResearchPaper::where('school_id', $paper->school_id)
                ->where('paper_id', '!=', $paper->paper_id)
                ->whereNotNull('cleaned_text')
                ->where('cleaned_text', '!=', '')
                ->where(DB::raw('LENGTH(cleaned_text)'), '>=', 50)
                ->get();

            Log::info("Similarity check for paper {$paper->paper_id}: found {$existingPapers->count()} papers to compare against.");

            if ($existingPapers->isEmpty()) {
                Log::info("No existing papers to compare — similarity stays 0%");
                return 0;
            }

            // Log existing paper IDs and text lengths for debugging
            foreach ($existingPapers as $ep) {
                Log::info("  → Comparing against paper {$ep->paper_id} ('{$ep->title}'), text length: " . strlen($ep->cleaned_text));
            }

            $comparisonResults = $this->similarityService->comparePapers(
                $cleanedText,
                $existingPapers,
                $paper->paper_id
            );

            $highestSimilarity = min(100, $comparisonResults['highest_similarity']);

            Log::info("Comparison done. Highest similarity: {$highestSimilarity}%");

            // Save individual similarity results
            foreach ($comparisonResults['all_results'] as $result) {
                $score = min(100, $result['similarity_score']);
                SimilarityResult::updateOrCreate(
                    [
                        'source_paper_id'   => $paper->paper_id,
                        'compared_paper_id' => $result['paper_id'],
                    ],
                    [
                        'similarity_score' => $score,
                        'checked_at'       => now(),
                    ]
                );
                Log::info("  → Paper {$paper->paper_id} vs {$result['paper_id']}: {$score}%");
            }

            // Update the paper's similarity percentage and flag if needed
            $paper->similarity_percentage = $highestSimilarity;
            if ($highestSimilarity >= 70) {
                $paper->status = 'flagged';
                Log::info("Paper {$paper->paper_id} FLAGGED at {$highestSimilarity}%");
            }
            $paper->save();

            return $highestSimilarity;

        } catch (\Exception $e) {
            Log::error("Similarity check failed for paper {$paper->paper_id}: " . $e->getMessage());
            return 0;
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

            $paperData = $this->transformPaper($paper);
            $paperData['similarity_results'] = $paper->similarityResults
                ? $paper->similarityResults->map(function($result) {
                    return [
                        'similarity_result_id' => $result->similarity_result_id,
                        'compared_paper_id'    => $result->compared_paper_id,
                        'similarity_score'     => $result->similarity_score,
                        'checked_at'           => $result->checked_at,
                        'compared_paper'       => $result->comparedPaper ? [
                            'paper_id'         => $result->comparedPaper->paper_id,
                            'title'            => $result->comparedPaper->title,
                            'reference_number' => $result->comparedPaper->reference_number,
                        ] : null,
                    ];
                })
                : [];

            return response()->json(['success' => true, 'data' => $paperData]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch paper: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Paper not found'], 404);
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
                'title'    => 'sometimes|string|max:255',
                'abstract' => 'sometimes|string',
                'status'   => 'sometimes|in:pending,approved,rejected,flagged'
            ]);
            $paper->update($request->only(['title', 'abstract', 'status']));
            return response()->json(['success' => true, 'message' => 'Paper updated successfully', 'data' => $paper]);
        } catch (\Exception $e) {
            Log::error('Failed to update paper: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update paper', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified research paper
     */
    public function destroy($id)
    {
        try {
            $paper = ResearchPaper::findOrFail($id);
            if (Storage::disk('local')->exists($paper->pdf_path)) {
                Storage::disk('local')->delete($paper->pdf_path);
            }
            $paper->delete();
            return response()->json(['success' => true, 'message' => 'Paper deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete paper: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to delete paper', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update paper status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate(['status' => 'required|in:pending,approved,rejected,flagged']);
            $paper = ResearchPaper::findOrFail($id);
            $paper->status = $request->status;
            $paper->save();
            return response()->json(['success' => true, 'message' => 'Status updated successfully', 'data' => $paper]);
        } catch (\Exception $e) {
            Log::error('Failed to update status: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to update status', 'error' => $e->getMessage()], 500);
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
                return response()->json(['success' => false, 'message' => 'File not found'], 404);
            }
            $filePath = storage_path('app/' . $paper->pdf_path);
            return response()->download($filePath, $paper->title . '.pdf');
        } catch (\Exception $e) {
            Log::error('Failed to download paper: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to download paper', 'error' => $e->getMessage()], 500);
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
                        'compared_paper_id'    => $result->compared_paper_id,
                        'compared_paper_title' => $result->comparedPaper->title ?? 'Unknown',
                        'similarity_score'     => $result->similarity_score,
                        'checked_at'           => $result->checked_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data'    => [
                    'paper_id'           => $paper->paper_id,
                    'paper_title'        => $paper->title,
                    'overall_similarity' => $paper->similarity_percentage,
                    'matches'            => $similarityResults,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch similarity details: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch similarity details', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Manually re-run similarity check for an existing paper (useful for fixing old 0% papers)
     */
    public function recheckSimilarity($id)
    {
        try {
            $paper = ResearchPaper::findOrFail($id);

            if (empty($paper->cleaned_text) || strlen(trim($paper->cleaned_text)) < 50) {
                // Try to re-extract text from the PDF
                if (!empty($paper->pdf_path) && Storage::disk('local')->exists($paper->pdf_path)) {
                    $paper->cleaned_text = $this->similarityService->extractText($paper->pdf_path);
                    $paper->save();
                    Log::info("Re-extracted text for paper {$paper->paper_id}, length: " . strlen($paper->cleaned_text));
                }
            }

            if (empty($paper->cleaned_text) || strlen(trim($paper->cleaned_text)) < 50) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot extract text from this paper\'s PDF.'
                ], 422);
            }

            $highestSimilarity = $this->runSimilarityCheck($paper, $paper->cleaned_text);

            return response()->json([
                'success'              => true,
                'message'              => 'Similarity re-checked successfully.',
                'similarity_percentage' => $highestSimilarity,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to recheck similarity: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to recheck similarity', 'error' => $e->getMessage()], 500);
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
            return response()->json(['success' => true, 'data' => $papers]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch school papers: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch papers', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get research papers for the authenticated student
     */
    public function getStudentPapers(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);

            $student = $user->student;
            if (!$student) return response()->json(['success' => false, 'message' => 'User is not a student'], 403);

            $query = ResearchPaper::with(['student.user', 'program', 'academicYear', 'school'])
                ->where('student_id', $student->student_id);

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $sortField     = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            $perPage = $request->get('per_page', 10);
            $papers  = $query->paginate($perPage);

            $papers->getCollection()->transform(function ($paper) {
                $data                   = $this->transformPaper($paper);
                $data['id']             = $paper->paper_id;
                $data['citations_count'] = $paper->citations_count ?? 0;
                $data['school']         = $paper->school ? [
                    'school_id'   => $paper->school->school_id,
                    'school_name' => $paper->school->school_name,
                ] : null;
                return $data;
            });

            return response()->json(['success' => true, 'data' => $papers], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch student papers: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to fetch research papers', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Shared paper transformation helper
     */
    private function transformPaper(ResearchPaper $paper): array
    {
        return [
            'paper_id'              => $paper->paper_id,
            'title'                 => $paper->title,
            'keywords'              => $paper->keywords,
            'abstract'              => $paper->abstract,
            'document_type'         => $paper->document_type,
            'status'                => $paper->status,
            'similarity_percentage' => $paper->similarity_percentage,
            'year_level'            => $paper->year_level ?? ($paper->student->year_level ?? null),
            'date_submitted'        => $paper->created_at,
            'created_at'            => $paper->created_at,
            'program'               => $paper->program ? [
                'program_id'   => $paper->program->program_id,
                'program_name' => $paper->program->program_name ?? $paper->program->name,
            ] : ($paper->student->program ?? null ? [
                'program_id'   => $paper->student->program->program_id,
                'program_name' => $paper->student->program->program_name ?? $paper->student->program->name,
            ] : null),
            'student'               => $paper->student ? [
                'student_id' => $paper->student->student_id,
                'year_level' => $paper->student->year_level,
                'user'       => $paper->student->user ? [
                    'user_id'     => $paper->student->user->user_id,
                    'name'        => trim($paper->student->user->first_name . ' ' . $paper->student->user->last_name),
                    'first_name'  => $paper->student->user->first_name,
                    'last_name'   => $paper->student->user->last_name,
                    'email'       => $paper->student->user->email,
                ] : null,
            ] : null,
            'academic_year'         => $paper->academicYear ? [
                'academic_year_id' => $paper->academicYear->academic_year_id,
                'year'             => $paper->academicYear->year,
            ] : null,
        ];
    }
}