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

    const HIGH_SIMILARITY_THRESHOLD   = 70;
    const MEDIUM_SIMILARITY_THRESHOLD = 50;

    // Minimum consecutive words to count as a "matching phrase"
    const MIN_PHRASE_WORDS = 6;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    // ─────────────────────────────────────────────
    //  PDF EXTRACTION
    // ─────────────────────────────────────────────

    public function extractText($filePath)
    {
        $disk = Storage::disk('local');
        if (!$disk->exists($filePath)) {
            Log::error("FILE NOT FOUND: " . $filePath);
            return '';
        }

        $fullPath   = $disk->path($filePath);
        $fileSizeMB = round(filesize($fullPath) / 1024 / 1024, 2);
        Log::info("Processing PDF: " . basename($filePath) . " ({$fileSizeMB}MB)");

        $extractedText = '';

        // Method 1: Smalot
        try {
            $pdf  = $this->parser->parseFile($fullPath);
            $text = $pdf->getText();
            if (!empty(trim($text)) && strlen(trim($text)) >= 100) {
                $extractedText = $text;
                Log::info("Smalot OK. Length: " . strlen($text));
            }
        } catch (\Exception $e) {
            Log::warning("Smalot failed: " . $e->getMessage());
        }

        // Method 2: pdftotext
        if (strlen(trim($extractedText)) < 100) {
            $text = $this->extractWithPdftotext($fullPath);
            if (strlen(trim($text)) > 100) $extractedText = $text;
        }

        // Method 3: raw regex
        if (strlen(trim($extractedText)) < 100) {
            try {
                $content = file_get_contents($fullPath);
                preg_match_all('/\/Text(.*?)\[\(([^)]+)\)\]/s', $content, $m);
                $extractedText = !empty($m[2])
                    ? implode(' ', $m[2])
                    : preg_replace('/\s+/', ' ', preg_replace('/[^a-zA-Z0-9\s\.\,\-\:]/', ' ', $content));
            } catch (\Exception $e) {
                Log::warning("Raw extraction failed: " . $e->getMessage());
            }
        }

        if (strlen(trim($extractedText)) > 100) {
            $cleaned = $this->cleanExtractedText($extractedText);
            Log::info("Final text length: " . strlen($cleaned));
            return $cleaned;
        }

        Log::error("All extraction methods failed: " . $filePath);
        return '';
    }

    private function cleanExtractedText($text)
    {
        $text  = preg_replace('/\r\n|\r/', "\n", $text);
        $text  = preg_replace('/[ \t]+/', ' ', $text);
        $text  = preg_replace('/\n{3,}/', "\n\n", $text);
        $lines = array_filter(explode("\n", $text), fn($l) =>
            strlen(trim($l)) > 5 && !preg_match('/^[\d\s]+$/', trim($l))
        );
        return implode("\n", $lines);
    }

    private function extractWithPdftotext($filePath)
    {
        if (!function_exists('shell_exec')) return '';
        foreach (["-layout", "-raw", "-nopgbrk"] as $flag) {
            $out = shell_exec("pdftotext $flag " . escapeshellarg($filePath) . " - 2>&1");
            if (!empty($out) && strlen(trim($out)) > 100) return $out;
        }
        return '';
    }

    public function cleanText($text)
    {
        return $this->cleanExtractedText($text);
    }

    // ─────────────────────────────────────────────
    //  MAIN COMPARISON — phrase/sentence based only
    // ─────────────────────────────────────────────

    /**
     * Score is based ONLY on matching phrases and sentences.
     * Different-topic papers will score near 0% because they
     * won't share 6+ consecutive meaningful words.
     */
    public function comparePapers($newText, $existingPapers, $newPaperId = null)
    {
        $results        = [];
        $highestOverall = 0;
        $mostSimilarId  = null;

        if (empty($newText) || strlen(trim($newText)) < 50) {
            Log::warning("New paper text too short.");
            return $this->emptyResult();
        }

        // Pre-compute once for the new paper
        $newSentences = $this->extractSentences($newText);
        $newNgrams    = $this->buildPhraseNgrams($newText, self::MIN_PHRASE_WORDS);

        Log::info("New paper: " . count($newSentences) . " sentences, " . count($newNgrams) . " phrase n-grams");

        foreach ($existingPapers as $paper) {
            if ($newPaperId && $paper->paper_id == $newPaperId) continue;

            $existingText = $paper->cleaned_text ?? '';
            if (strlen(trim($existingText)) < 50) {
                Log::warning("Paper {$paper->paper_id} has no usable text — skipping.");
                continue;
            }

            // Score 1: sentence-level overlap  (50%)
            $sentenceScore = $this->sentenceOverlapScore($newSentences, $existingText);

            // Score 2: phrase n-gram overlap    (50%)
            $phraseScore   = $this->phraseNgramScore($newNgrams, $existingText);

            $finalScore = round(min(100, max(0, ($sentenceScore * 0.50) + ($phraseScore * 0.50))), 2);

            Log::info("Paper {$paper->paper_id}: sentence={$sentenceScore}% phrase={$phraseScore}% final={$finalScore}%");

            $results[] = [
                'paper_id'         => $paper->paper_id,
                'title'            => $paper->title,
                'similarity_score' => $finalScore,
            ];

            if ($finalScore > $highestOverall) {
                $highestOverall = $finalScore;
                $mostSimilarId  = $paper->paper_id;
            }
        }

        usort($results, fn($a, $b) => $b['similarity_score'] <=> $a['similarity_score']);

        Log::info("Highest similarity: {$highestOverall}% (paper {$mostSimilarId})");

        return [
            'highest_similarity'    => $highestOverall,
            'most_similar_paper_id' => $mostSimilarId,
            'all_results'           => $results,
            'similarity_level'      => $this->getSimilarityLevel($highestOverall),
        ];
    }

    // ─────────────────────────────────────────────
    //  SCORE 1: Sentence-level overlap
    //  A sentence "matches" only if 85%+ of its
    //  content words appear in a sentence from the
    //  other paper. Generic sentences won't match.
    // ─────────────────────────────────────────────

    private function sentenceOverlapScore(array $newSentences, string $existingText): float
    {
        if (empty($newSentences)) return 0;

        $existingSentences = $this->extractSentences($existingText);
        if (empty($existingSentences)) return 0;

        $matchedCount      = 0;
        $eligibleCount     = 0;

        foreach ($newSentences as $ns) {
            $nsWords = $this->sentenceToWords($ns);
            if (count($nsWords) < 5) continue; // too short to be meaningful
            $eligibleCount++;

            foreach ($existingSentences as $es) {
                $esWords = $this->sentenceToWords($es);
                if (count($esWords) < 5) continue;

                if ($this->wordOverlapRatio($nsWords, $esWords) >= 0.85) {
                    $matchedCount++;
                    break;
                }
            }
        }

        if ($eligibleCount === 0) return 0;

        return round(($matchedCount / $eligibleCount) * 100, 2);
    }

    // ─────────────────────────────────────────────
    //  SCORE 2: Phrase n-gram overlap
    //  Checks how many runs of MIN_PHRASE_WORDS
    //  consecutive meaningful words appear verbatim
    //  in both papers.
    // ─────────────────────────────────────────────

    private function phraseNgramScore(array $newNgrams, string $existingText): float
    {
        if (empty($newNgrams)) return 0;

        $existingNgrams = $this->buildPhraseNgrams($existingText, self::MIN_PHRASE_WORDS);
        if (empty($existingNgrams)) return 0;

        $existingSet    = array_flip($existingNgrams);
        $matchedPhrases = 0;

        foreach ($newNgrams as $ngram) {
            if (isset($existingSet[$ngram])) {
                $matchedPhrases++;
            }
        }

        // Jaccard
        $union = count(array_unique(array_merge($newNgrams, $existingNgrams)));
        if ($union === 0) return 0;

        return round(($matchedPhrases / $union) * 100, 2);
    }

    // ─────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────

    /**
     * Split text into sentences by punctuation.
     */
    private function extractSentences(string $text): array
    {
        $text = preg_replace('/\s+/', ' ', $text);
        $raw  = preg_split('/(?<=[.!?])\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        return array_values(array_filter($raw, fn($s) => strlen(trim($s)) > 20));
    }

    /**
     * Lowercase + remove punctuation + split into words.
     * Keeps ALL content words (only removes short function words)
     * so sentence matching is strict.
     */
    private function sentenceToWords(string $sentence): array
    {
        $sentence = strtolower($sentence);
        $sentence = preg_replace('/[^a-z0-9\s]/', ' ', $sentence);
        $words    = preg_split('/\s+/', trim($sentence), -1, PREG_SPLIT_NO_EMPTY);

        // Only remove ultra-short function words
        $ignore = array_flip([
            'the','a','an','is','are','was','were','be','been','being',
            'to','of','in','on','at','by','as','or','and','but','not',
            'it','its','this','that',
        ]);

        return array_values(array_filter($words, fn($w) => !isset($ignore[$w]) && strlen($w) > 1));
    }

    /**
     * Jaccard word overlap between two word arrays.
     */
    private function wordOverlapRatio(array $words1, array $words2): float
    {
        $set1 = array_flip(array_unique($words1));
        $set2 = array_flip(array_unique($words2));

        $intersection = count(array_intersect_key($set1, $set2));
        $union        = count(array_unique(array_merge(array_keys($set1), array_keys($set2))));

        return $union > 0 ? $intersection / $union : 0;
    }

    /**
     * Build phrase n-grams: sliding window of $n consecutive
     * meaningful (stopword-free) words.
     */
    private function buildPhraseNgrams(string $text, int $n): array
    {
        $text  = strtolower($text);
        $text  = preg_replace('/[^a-z0-9\s]/', ' ', $text);
        $words = preg_split('/\s+/', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        $stopwords = array_flip($this->getStopwords());
        $words     = array_values(array_filter($words, fn($w) => !isset($stopwords[$w]) && strlen($w) > 2));

        $ngrams = [];
        $count  = count($words);
        for ($i = 0; $i <= $count - $n; $i++) {
            $ngrams[] = implode(' ', array_slice($words, $i, $n));
        }

        return array_unique($ngrams);
    }

    private function getStopwords(): array
    {
        return [
            'the','and','for','with','this','that','from','have','was','were',
            'are','but','not','you','your','can','all','will','just','very',
            'too','also','its','our','they','them','then','than','their','there',
            'has','had','been','being','into','over','such','when','where','who',
            'how','what','more','about','after','before','other','would','could',
            'should','these','those','which','while','each','both','few','most',
            'some','any','out','use','used','using','may','might','shall','did',
            'does','own','same','between','through','during','without','within',
            'among','against','per','since','under','above','below','only',
        ];
    }

    private function emptyResult(): array
    {
        return [
            'highest_similarity'    => 0,
            'most_similar_paper_id' => null,
            'all_results'           => [],
            'similarity_level'      => 'LOW',
        ];
    }

    private function getSimilarityLevel(float $score): string
    {
        if ($score >= self::HIGH_SIMILARITY_THRESHOLD)   return 'HIGH';
        if ($score >= self::MEDIUM_SIMILARITY_THRESHOLD) return 'MEDIUM';
        return 'LOW';
    }

    public function compareWithSchool($newText, $schoolId, $newPaperId = null)
    {
        $existingPapers = ResearchPaper::where('school_id', $schoolId)
            ->when($newPaperId, fn($q) => $q->where('paper_id', '!=', $newPaperId))
            ->whereNotNull('cleaned_text')
            ->where('cleaned_text', '!=', '')
            ->get();

        if ($existingPapers->isEmpty()) {
            return $this->emptyResult();
        }

        return $this->comparePapers($newText, $existingPapers, $newPaperId);
    }
}