<?php

namespace App\Jobs;

use App\Models\ResearchPaper;
use App\Models\SimilarityResult;
use App\Services\SimilarityService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessSimilarityJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $paper;
    
    public $timeout = 300;
    public $tries = 3;

    public function __construct(ResearchPaper $paper)
    {
        $this->paper = $paper;
    }

    public function handle(SimilarityService $similarityService)
    {
        try {
            $paper = ResearchPaper::find($this->paper->paper_id);
            
            if (!$paper) {
                Log::warning("Paper {$this->paper->paper_id} no longer exists");
                return;
            }
            
            if (empty($paper->cleaned_text)) {
                Log::warning("Paper {$paper->paper_id} has no cleaned text");
                $paper->similarity_percentage = 0;
                $paper->save();
                return;
            }

            // Get ALL existing papers EXCEPT the current one
            $existingPapers = ResearchPaper::where('school_id', $paper->school_id)
                ->whereNotNull('cleaned_text')
                ->where('cleaned_text', '!=', '')
                ->where('paper_id', '!=', $paper->paper_id) // Exclude current paper
                ->get();

            if ($existingPapers->isEmpty()) {
                Log::info("No existing papers to compare with for paper {$paper->paper_id}");
                $paper->similarity_percentage = 0;
                $paper->save();
                return;
            }

            Log::info("Comparing NEW paper {$paper->paper_id} with " . count($existingPapers) . " existing papers");

            // Compare the NEW paper against ALL existing papers
            $comparisonResults = $similarityService->comparePapers(
                $paper->cleaned_text,  // New paper text
                $existingPapers,        // All existing papers (including the original)
                $paper->paper_id        // Current paper ID to exclude from results
            );

            // Cap the highest similarity at 100%
            $highestSimilarity = min(100, $comparisonResults['highest_similarity']);
            
            // Store similarity results for the NEW paper
            $storedResults = 0;
            foreach ($comparisonResults['all_results'] as $result) {
                try {
                    $similarityScore = min(100, $result['similarity_score']);
                    
                    // Store result showing how similar NEW paper is to each existing paper
                    SimilarityResult::updateOrCreate(
                        [
                            'source_paper_id' => $paper->paper_id,      // NEW paper
                            'compared_paper_id' => $result['paper_id'], // EXISTING paper
                        ],
                        [
                            'similarity_score' => $similarityScore,
                            'checked_at' => now(),
                        ]
                    );
                    
                    Log::info("New paper {$paper->paper_id} is {$similarityScore}% similar to existing paper {$result['paper_id']}");
                    $storedResults++;
                    
                } catch (\Exception $e) {
                    Log::error("Failed to store result: " . $e->getMessage());
                }
            }

            Log::info("Stored {$storedResults} similarity results for NEW paper {$paper->paper_id}");

            // Update ONLY the NEW paper with its similarity score
            $paper->similarity_percentage = $highestSimilarity;

            // Flag the NEW paper if it's too similar to any existing paper
            if ($highestSimilarity >= 70) {
                $paper->status = 'flagged';
                Log::info("NEW paper {$paper->paper_id} FLAGGED with {$highestSimilarity}% similarity");
            }

            $paper->save();

            // IMPORTANT: DO NOT update the original paper's similarity
            // The original paper keeps its original similarity score

            Log::info("Similarity check completed for NEW paper {$paper->paper_id}. Highest similarity: {$highestSimilarity}%");

        } catch (\Exception $e) {
            Log::error("Job failed for paper {$this->paper->paper_id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error("Job failed permanently for paper {$this->paper->paper_id}: " . $exception->getMessage());
        
        try {
            $paper = ResearchPaper::find($this->paper->paper_id);
            if ($paper) {
                $paper->similarity_percentage = 0;
                $paper->save();
            }
        } catch (\Exception $e) {
            Log::error("Failed to update paper after failure: " . $e->getMessage());
        }
    }
}