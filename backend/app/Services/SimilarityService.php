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
                if (!empty($sectionText) && strlen($sectionText) > 100) {
                    $sections[$sectionName] = $sectionText;
                }
            }
        }
        
        // If sections not found, split by paragraphs
        if (empty($sections)) {
            $paragraphs = explode("\n\n", $text);
            foreach ($paragraphs as $index => $paragraph) {
                $paragraph = trim($paragraph);
                if (strlen($paragraph) > 100) { // Only substantial paragraphs
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
        
        // Extract sections from new paper
        $newSections = $this->extractSections($newText);
        
        foreach ($existingPapers as $paper) {
            if ($newPaperId && $paper->paper_id == $newPaperId) continue;
            if (empty($paper->cleaned_text)) continue;
            
            // Extract sections from existing paper
            $existingSections = $this->extractSections($paper->cleaned_text);
            
            // Calculate similarities using multiple methods
            $overallScore = $this->calculateOverallSimilarity($newText, $paper->cleaned_text);
            $sectionScore = $this->calculateSectionSimilarity($newSections, $existingSections);
            $phraseScore = $this->calculatePhraseSimilarity($newText, $paper->cleaned_text);
            $paragraphScore = $this->calculateParagraphSimilarity($newText, $paper->cleaned_text);
            
            // Weighted score (customize weights as needed)
            $weightedScore = 
                ($overallScore * 0.3) +
                ($sectionScore * 0.3) +
                ($phraseScore * 0.2) +
                ($paragraphScore * 0.2);
            
            $finalScore = round($weightedScore, 2);
            
            // Store breakdown in a format that can be JSON encoded
            $breakdown = [
                'overall' => $overallScore,
                'section_based' => $sectionScore,
                'phrase_based' => $phraseScore,
                'paragraph_based' => $paragraphScore,
                'matched_sections' => $this->getMatchedSections($newSections, $existingSections)
            ];
            
            $results[$paper->paper_id] = [
                'paper_id' => $paper->paper_id,
                'title' => $paper->title,
                'similarity_score' => $finalScore,
                'breakdown' => $breakdown
            ];
            
            if ($finalScore > $highestOverall) {
                $highestOverall = $finalScore;
                $mostSimilarPaperId = $paper->paper_id;
            }
        }
        
        // Sort results by similarity score (highest first)
        usort($results, function($a, $b) {
            return $b['similarity_score'] <=> $a['similarity_score'];
        });
        
        Log::info("Similarity comparison complete. Highest score: {$highestOverall}%");
        
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
                if ($similarity > 40) {
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
        // Generate n-grams (phrases of 3-5 words)
        $ngrams1 = $this->generateNgrams($text1, [3, 4, 5]);
        $ngrams2 = $this->generateNgrams($text2, [3, 4, 5]);
        
        if (empty($ngrams1) || empty($ngrams2)) return 0;
        
        // Calculate Jaccard similarity on n-grams
        $intersection = array_intersect($ngrams1, $ngrams2);
        $union = array_unique(array_merge($ngrams1, $ngrams2));
        
        if (count($union) == 0) return 0;
        
        return round((count($intersection) / count($union)) * 100, 2);
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
                if (strlen($ngram) > 10) { // Only substantial phrases
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
        if (empty($sections1) || empty($sections2)) return 0;
        
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
            
            if ($bestMatch > 30) { // Threshold for significant match
                $totalScore += $bestMatch;
                $matchedSections++;
            }
        }
        
        return $matchedSections > 0 ? round($totalScore / $matchedSections, 2) : 0;
    }

    /**
     * Calculate phrase-based similarity using sliding window
     */
    private function calculatePhraseSimilarity($text1, $text2)
    {
        $words1 = explode(' ', $text1);
        $words2 = explode(' ', $text2);
        
        if (count($words1) < 20 || count($words2) < 20) {
            return $this->calculateTextSimilarity($text1, $text2);
        }
        
        $windowSize = 20; // Words per window
        $matches = 0;
        $totalWindows = 0;
        
        for ($i = 0; $i < count($words1) - $windowSize + 1; $i += 5) { // Slide by 5 words
            $phrase1 = implode(' ', array_slice($words1, $i, $windowSize));
            $bestMatch = 0;
            
            for ($j = 0; $j < count($words2) - $windowSize + 1; $j += 5) {
                $phrase2 = implode(' ', array_slice($words2, $j, $windowSize));
                $similarity = $this->calculateTextSimilarity($phrase1, $phrase2);
                if ($similarity > $bestMatch) {
                    $bestMatch = $similarity;
                }
            }
            
            if ($bestMatch > 40) { // Threshold for phrase match
                $matches += $bestMatch;
            }
            $totalWindows++;
        }
        
        return $totalWindows > 0 ? round($matches / $totalWindows, 2) : 0;
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
            if (strlen($p1) < 100) continue; // Skip short paragraphs
            
            $bestMatch = 0;
            
            foreach ($paragraphs2 as $p2) {
                if (strlen($p2) < 100) continue;
                
                $similarity = $this->calculateTextSimilarity($p1, $p2);
                if ($similarity > $bestMatch) {
                    $bestMatch = $similarity;
                }
            }
            
            if ($bestMatch > 35) { // Threshold for paragraph match
                $totalScore += $bestMatch;
                $matchedParagraphs++;
            }
        }
        
        return $matchedParagraphs > 0 ? round($totalScore / $matchedParagraphs, 2) : 0;
    }

    /**
     * Calculate similarity between two text snippets
     */
    private function calculateTextSimilarity($text1, $text2)
    {
        if (empty($text1) || empty($text2)) return 0;
        
        $words1 = explode(' ', $text1);
        $words2 = explode(' ', $text2);
        
        if (count($words1) < 5 || count($words2) < 5) return 0;
        
        $commonWords = array_intersect($words1, $words2);
        $totalUnique = count(array_unique(array_merge($words1, $words2)));
        
        if ($totalUnique == 0) return 0;
        
        // Check for sequential matches (phrase matching)
        $sequentialMatches = $this->findLongestCommonSequence($words1, $words2);
        $sequentialBonus = ($sequentialMatches / min(count($words1), count($words2))) * 50;
        
        $basicScore = (count($commonWords) / $totalUnique) * 100;
        
        return min(100, round($basicScore + $sequentialBonus, 2));
    }

    /**
     * Find longest common sequence of words
     */
    private function findLongestCommonSequence($words1, $words2)
    {
        $maxLength = 0;
        
        for ($i = 0; $i < count($words1); $i++) {
            for ($j = 0; $j < count($words2); $j++) {
                $currentLength = 0;
                while ($i + $currentLength < count($words1) && 
                       $j + $currentLength < count($words2) && 
                       $words1[$i + $currentLength] == $words2[$j + $currentLength]) {
                    $currentLength++;
                }
                if ($currentLength > $maxLength) {
                    $maxLength = $currentLength;
                }
            }
        }
        
        return $maxLength;
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