<?php

namespace App\Services;

use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\ResearchPaper;
use App\Models\SimilarityResult;

class SimilarityService
{
    protected $parser;
    
    const HIGH_SIMILARITY_THRESHOLD = 70;
    const MEDIUM_SIMILARITY_THRESHOLD = 50;
    const MAX_EXECUTION_TIME = 300;
    
    public function __construct()
    {
        $this->parser = new Parser();
    }

    /**
     * Extract text from PDF with multiple fallback methods
     */
    public function extractText($filePath)
    {
        $disk = Storage::disk('local');
        if (!$disk->exists($filePath)) {
            Log::error("FILE NOT FOUND: " . $filePath);
            return '';
        }

        $fullPath = $disk->path($filePath);
        $fileSize = filesize($fullPath);
        $fileSizeMB = round($fileSize / 1024 / 1024, 2);
        
        Log::info("Processing PDF: " . basename($filePath) . " - Size: {$fileSizeMB}MB");
        
        // For large files (> 2MB), try pdftotext first (more memory efficient)
        if ($fileSize > 2 * 1024 * 1024) {
            Log::info("Large file detected, trying pdftotext first");
            $text = $this->extractWithPdftotext($fullPath);
            if (!empty($text)) {
                return $this->preserveStructure($text);
            }
        }
        
        // METHOD 1: Try Smalot PDF Parser
        try {
            $pdf = $this->parser->parseFile($fullPath);
            $text = $pdf->getText();
            
            if (!empty(trim($text))) {
                Log::info("Smalot PDF parser successful. Text length: " . strlen($text));
                return $this->preserveStructure($text);
            }
        } catch (\Exception $e) {
            Log::warning("Smalot PDF parser failed: " . $e->getMessage());
        }
        
        // METHOD 2: Try pdftotext (if available)
        $text = $this->extractWithPdftotext($fullPath);
        if (!empty($text)) {
            return $this->preserveStructure($text);
        }
        
        // METHOD 3: Try reading raw content (last resort)
        try {
            $content = file_get_contents($fullPath);
            // Simple text extraction from raw PDF
            $text = preg_replace('/.*?endstream/s', '', $content);
            $text = preg_replace('/[^a-zA-Z0-9\s]/', ' ', $text);
            $text = preg_replace('/\s+/', ' ', $text);
            
            if (!empty(trim($text)) && strlen($text) > 500) {
                Log::info("Raw content extraction successful. Text length: " . strlen($text));
                return $this->preserveStructure($text);
            }
        } catch (\Exception $e) {
            Log::warning("Raw content fallback failed: " . $e->getMessage());
        }
        
        // If all methods fail
        Log::error("All PDF extraction methods failed for: " . $filePath);
        return '';
    }

    /**
     * Extract text using pdftotext command line tool
     */
    private function extractWithPdftotext($filePath)
    {
        try {
            // Check if pdftotext is available
            if (!function_exists('shell_exec')) {
                Log::warning("shell_exec is disabled");
                return '';
            }
            
            // Try to get pdftotext version to check if it's installed
            $versionCheck = shell_exec("pdftotext -v 2>&1");
            if (empty($versionCheck)) {
                Log::warning("pdftotext not found in system PATH");
                return '';
            }
            
            // Use pdftotext to extract text
            // -nopgbrk: don't insert page breaks
            // -layout: preserve layout (optional, can be removed for cleaner text)
            $command = "pdftotext -nopgbrk " . escapeshellarg($filePath) . " - 2>&1";
            $output = shell_exec($command);
            
            if (!empty($output) && strlen(trim($output)) > 100) {
                Log::info("pdftotext extraction successful. Text length: " . strlen($output));
                return $output;
            } else {
                Log::warning("pdftotext returned empty or too short text");
                return '';
            }
        } catch (\Exception $e) {
            Log::error("pdftotext extraction failed: " . $e->getMessage());
            return '';
        }
    }

    /**
     * Preserve document structure (paragraphs, sections)
     */
    private function preserveStructure($text)
    {
        if (empty($text)) return '';
        
        // Normalize line endings
        $text = preg_replace('/\r\n/', "\n", $text);
        $text = preg_replace('/\r/', "\n", $text);
        
        // Preserve paragraph breaks (multiple newlines)
        $text = preg_replace('/\n\s*\n/', "[PARAGRAPH_BREAK]", $text);
        
        // Normalize other whitespace but keep structure
        $text = preg_replace('/[^\S\n]+/', ' ', $text);
        
        // Restore paragraph breaks
        $text = preg_replace('/\[PARAGRAPH_BREAK\]/', "\n\n", $text);
        
        // Remove extra spaces
        $text = preg_replace('/[ \t]+/', ' ', $text);
        
        return trim($text);
    }

    /**
     * Clean text while preserving structure
     */
    public function cleanText($text)
    {
        if (empty($text)) return '';
        
        try {
            // Convert to lowercase
            $text = strtolower($text);
            
            // Remove special characters but keep paragraph breaks and periods
            $text = preg_replace('/[^a-z0-9\s\n\.]/', ' ', $text);
            $text = preg_replace('/\s+/', ' ', $text);
            
            // Remove stopwords
            $stopwords = $this->getStopwords();
            
            // Split into paragraphs
            $paragraphs = explode("\n\n", $text);
            $cleanedParagraphs = [];
            
            foreach ($paragraphs as $paragraph) {
                $words = explode(' ', trim($paragraph));
                $filtered = array_filter($words, function ($word) use ($stopwords) {
                    return !in_array($word, $stopwords) && strlen($word) > 2;
                });
                
                if (!empty($filtered)) {
                    $cleanedParagraphs[] = implode(' ', $filtered);
                }
            }
            
            $result = implode("\n\n", $cleanedParagraphs);
            
            // If result is too short, maybe it's not valid text
            if (strlen($result) < 50) {
                Log::warning("Cleaned text too short (" . strlen($result) . " chars)");
                return '';
            }
            
            Log::info("Text cleaning successful. Final length: " . strlen($result));
            return $result;
            
        } catch (\Exception $e) {
            Log::error('cleanText error: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * Get stopwords list
     */
    private function getStopwords()
    {
        return [
            'the','is','and','in','of','to','a','for','on','with',
            'as','by','an','be','this','that','are','was','were',
            'but','or','at','from','has','have','had','will','would',
            'could','should','may','might','must','than','then','than',
            'also','very','just','can','their','they','them','these','those',
            'it','its','we','our','you','your','he','him','his','she','her',
            'which','what','when','where','who','whom','whose','why','how',
            'all','any','both','each','few','more','most','other','some','such',
            'no','nor','not','only','own','same','so','than','too','very',
            's','t','ll','ve','re','d','m','o','ma','am'
        ];
    }

    /**
     * Extract sections from document
     */
    public function extractSections($text)
    {
        $sections = [];
        
        if (empty($text)) {
            return $sections;
        }
        
        // Common section headers in research papers
        $sectionPatterns = [
            'abstract' => '/abstract(.*?)(?=introduction|methodology|methods|results|discussion|conclusion|references)/is',
            'introduction' => '/introduction(.*?)(?=methodology|methods|literature review|related work|results|discussion|conclusion)/is',
            'methodology' => '/(methodology|methods|research design)(.*?)(?=results|findings|discussion|conclusion)/is',
            'results' => '/(results|findings)(.*?)(?=discussion|conclusion|recommendations)/is',
            'discussion' => '/discussion(.*?)(?=conclusion|recommendations|references)/is',
            'conclusion' => '/(conclusion|conclusions|recommendations)(.*?)(?=references|appendix)/is',
            'references' => '/(references|bibliography|works cited)(.*?)$/is'
        ];
        
        foreach ($sectionPatterns as $sectionName => $pattern) {
            if (preg_match($pattern, $text, $matches)) {
                $sectionText = trim($matches[1] ?? $matches[0]);
                if (!empty($sectionText) && strlen($sectionText) > 50) { // Binawasan ang threshold
                    $sections[$sectionName] = $sectionText;
                }
            }
        }
        
        // If sections not found, split by paragraphs
        if (empty($sections)) {
            $paragraphs = explode("\n\n", $text);
            foreach ($paragraphs as $index => $paragraph) {
                $paragraph = trim($paragraph);
                if (strlen($paragraph) > 50) { // Binawasan ang threshold
                    $sections['paragraph_' . ($index + 1)] = $paragraph;
                }
            }
        }
        
        Log::info("Extracted " . count($sections) . " sections from document");
        return $sections;
    }

    /**
     * Main similarity comparison method
     */
    public function comparePapers($newText, $existingPapers, $newPaperId = null)
    {
        $results = [];
        $highestOverall = 0;
        $mostSimilarPaperId = null;
        
        if (empty($newText)) {
            Log::warning("New paper text is empty, skipping comparison");
            return [
                'highest_similarity' => 0,
                'most_similar_paper_id' => null,
                'all_results' => [],
                'similarity_level' => 'LOW'
            ];
        }
        
        foreach ($existingPapers as $paper) {
            if ($newPaperId && $paper->paper_id == $newPaperId) continue;
            if (empty($paper->cleaned_text)) continue;
            
            Log::info("Comparing with paper ID: " . $paper->paper_id);
            
            // Calculate similarity between NEW paper and this existing paper
            $sections1 = $this->extractSections($newText);
            $sections2 = $this->extractSections($paper->cleaned_text);

            $sectionScore = $this->calculateSectionSimilarity($sections1, $sections2);
            $paragraphScore = $this->calculateParagraphSimilarity($newText, $paper->cleaned_text);
            $phraseScore = $this->calculatePhraseSimilarity($newText, $paper->cleaned_text);
            $ngramScore = $this->calculateOverallSimilarity($newText, $paper->cleaned_text);
            $textScore = $this->calculateTextSimilarity($newText, $paper->cleaned_text);
            
            // Kunin ang average ng lahat ng scores para sa paper na ito
            $scores = [$sectionScore, $paragraphScore, $phraseScore, $ngramScore, $textScore];
            
            // Remove zeros but keep at least one score
            $validScores = array_filter($scores, function($score) {
                return $score > 0;
            });
            
            if (empty($validScores)) {
                // If all scores are zero, use text similarity as fallback (without threshold)
                $textScore = $this->calculateTextSimilarity($newText, $paper->cleaned_text);
                $averageScore = $textScore > 0 ? $textScore : 0;
            } else {
                $averageScore = array_sum($validScores) / count($validScores);
            }
            
            // Ensure score is between 0-100
            $finalScore = round(min(100, max(0, $averageScore)), 2);
            
            Log::info("Average score for paper {$paper->paper_id}: {$finalScore}%", [
                'section' => $sectionScore,
                'paragraph' => $paragraphScore,
                'phrase' => $phraseScore,
                'ngram' => $ngramScore,
                'text' => $textScore
            ]);
            
            $results[] = [
                'paper_id' => $paper->paper_id,
                'title' => $paper->title,
                'similarity_score' => $finalScore
            ];
            
            // Check kung ito ang pinakamataas na score sa lahat ng papers
            if ($finalScore > $highestOverall) {
                $highestOverall = $finalScore;
                $mostSimilarPaperId = $paper->paper_id;
            }
        }
        
        // Sort results by similarity (highest first)
        usort($results, function($a, $b) {
            return $b['similarity_score'] <=> $a['similarity_score'];
        });
        
        Log::info("Overall highest similarity: {$highestOverall}% from paper ID: {$mostSimilarPaperId}");
        
        return [
            'highest_similarity' => $highestOverall,
            'most_similar_paper_id' => $mostSimilarPaperId,
            'all_results' => $results,
            'similarity_level' => $this->getSimilarityLevel($highestOverall)
        ];
    }

    /**
     * Get matched sections between two papers
     */
    private function getMatchedSections($sections1, $sections2)
    {
        $matches = [];
        
        if (empty($sections1) || empty($sections2)) {
            return $matches;
        }
        
        foreach ($sections1 as $key1 => $section1) {
            foreach ($sections2 as $key2 => $section2) {
                $similarity = $this->calculateTextSimilarity($section1, $section2);
                if ($similarity > 20) { // Binawasan ang threshold
                    $matches[] = [
                        'section1' => $key1,
                        'section2' => $key2,
                        'similarity' => $similarity
                    ];
                }
            }
        }
        
        return $matches;
    }

    /**
     * Calculate overall similarity using n-grams
     */
    private function calculateOverallSimilarity($text1, $text2)
    {
        // Generate n-grams (phrases of 2-4 words para mas maraming match)
        $ngrams1 = $this->generateNgrams($text1, [2, 3, 4]);
        $ngrams2 = $this->generateNgrams($text2, [2, 3, 4]);
        
        if (empty($ngrams1) || empty($ngrams2)) {
            // Fallback to text similarity
            return $this->calculateTextSimilarity($text1, $text2);
        }
        
        // Calculate Jaccard similarity on n-grams
        $intersection = array_intersect($ngrams1, $ngrams2);
        
        if (empty($intersection)) {
            return 0;
        }
        
        // Use the smaller set as denominator para mas mataas ang score
        $denominator = min(count($ngrams1), count($ngrams2));
        
        if ($denominator == 0) return 0;
        
        return round(min(100, (count($intersection) / $denominator) * 100), 2);
    }

    /**
     * Generate n-grams from text
     */
    private function generateNgrams($text, $sizes = [3])
    {
        $words = explode(' ', $text);
        $ngrams = [];
        
        if (count($words) < min($sizes)) {
            return [];
        }
        
        foreach ($sizes as $size) {
            for ($i = 0; $i < count($words) - $size + 1; $i++) {
                $ngram = implode(' ', array_slice($words, $i, $size));
                if (strlen($ngram) > 5) { // Binawasan ang threshold
                    $ngrams[] = $ngram;
                }
            }
        }
        
        return array_unique($ngrams);
    }

    /**
     * Calculate section-based similarity
     */
    private function calculateSectionSimilarity($sections1, $sections2)
    {
        if (empty($sections1) || empty($sections2)) {
            return 0;
        }
        
        $totalScore = 0;
        $matchedSections = 0;
        
        foreach ($sections1 as $key1 => $section1) {
            $bestMatch = 0;
            
            foreach ($sections2 as $key2 => $section2) {
                $similarity = $this->calculateTextSimilarity($section1, $section2);
                if ($similarity > $bestMatch) {
                    $bestMatch = $similarity;
                }
            }
            
            // Remove threshold - kahit maliit na match, i-count
            if ($bestMatch > 0) {
                $totalScore += $bestMatch;
                $matchedSections++;
            }
        }
        
        // If no sections matched, return 0
        if ($matchedSections == 0) return 0;
        
        // Calculate average
        $averageScore = $totalScore / $matchedSections;
        return round(min(100, $averageScore), 2);
    }


    /**
     * Calculate phrase-based similarity using sliding window
     */
    private function calculatePhraseSimilarity($text1, $text2)
    {
        $words1 = explode(' ', $text1);
        $words2 = explode(' ', $text2);
        
        if (count($words1) < 10 || count($words2) < 10) { // Binawasan ang threshold
            return $this->calculateTextSimilarity($text1, $text2);
        }
        
        $windowSize = 10; // Binawasan ang window size
        $matches = 0;
        $totalWindows = 0;
        
        for ($i = 0; $i < count($words1) - $windowSize + 1; $i += 3) { // Slide by 3 words
            $phrase1 = implode(' ', array_slice($words1, $i, $windowSize));
            $bestMatch = 0;
            
            for ($j = 0; $j < count($words2) - $windowSize + 1; $j += 3) {
                $phrase2 = implode(' ', array_slice($words2, $j, $windowSize));
                $similarity = $this->calculateTextSimilarity($phrase1, $phrase2);
                if ($similarity > $bestMatch) {
                    $bestMatch = $similarity;
                }
            }
            
            // Remove threshold
            if ($bestMatch > 0) {
                $matches += $bestMatch;
            }
            $totalWindows++;
        }
        
        if ($totalWindows == 0) return 0;
        
        $averageMatch = $matches / $totalWindows;
        return round(min(100, $averageMatch), 2);
    }

    /**
     * Calculate paragraph-based similarity
     */
    private function calculateParagraphSimilarity($text1, $text2)
    {
        $paragraphs1 = explode("\n\n", $text1);
        $paragraphs2 = explode("\n\n", $text2);
        
        $totalScore = 0;
        $matchedParagraphs = 0;
        
        foreach ($paragraphs1 as $p1) {
            if (strlen($p1) < 50) continue; // Binawasan ang threshold
            
            $bestMatch = 0;
            
            foreach ($paragraphs2 as $p2) {
                if (strlen($p2) < 50) continue; // Binawasan ang threshold
                
                $similarity = $this->calculateTextSimilarity($p1, $p2);
                if ($similarity > $bestMatch) {
                    $bestMatch = $similarity;
                }
            }
            
            // Remove threshold
            if ($bestMatch > 0) {
                $totalScore += $bestMatch;
                $matchedParagraphs++;
            }
        }
        
        if ($matchedParagraphs == 0) return 0;
        
        $averageScore = $totalScore / $matchedParagraphs;
        return round(min(100, $averageScore), 2);
    }

    /**
     * Calculate similarity between two text snippets
     */
    private function calculateTextSimilarity($text1, $text2)
    {
        if (empty($text1) || empty($text2)) return 0;

        // Normalize spaces and lowercase
        $text1 = strtolower(trim(preg_replace('/\s+/', ' ', $text1)));
        $text2 = strtolower(trim(preg_replace('/\s+/', ' ', $text2)));

        // If texts are exactly the same
        if ($text1 === $text2) return 100;

        // Use similar_text for better accuracy
        similar_text($text1, $text2, $percent);
        
        return round(min(100, $percent), 2);
    }

    /**
     * Get similarity level description
     */
    private function getSimilarityLevel($score)
    {
        if ($score >= self::HIGH_SIMILARITY_THRESHOLD) {
            return 'HIGH';
        } elseif ($score >= self::MEDIUM_SIMILARITY_THRESHOLD) {
            return 'MEDIUM';
        } else {
            return 'LOW';
        }
    }

    /**
     * Compare with same school using enhanced methods
     */
    public function compareWithSchool($newText, $schoolId, $newPaperId = null)
    {
        $existingPapers = ResearchPaper::where('school_id', $schoolId)
            ->when($newPaperId, function ($query) use ($newPaperId) {
                $query->where('paper_id', '!=', $newPaperId);
            })
            ->whereNotNull('cleaned_text')
            ->get();

        if ($existingPapers->isEmpty()) {
            return [
                'highest_similarity' => 0,
                'most_similar_paper_id' => null,
                'all_results' => []
            ];
        }

        return $this->comparePapers($newText, $existingPapers, $newPaperId);
    }

    /**
     * Compute TF-IDF similarity (keeping original method for compatibility)
     */
    public function computeTfIdfSimilarity($text1, $text2)
    {
        return $this->calculateOverallSimilarity($text1, $text2);
    }
}