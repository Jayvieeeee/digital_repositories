<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SimilarityResult extends Model
{
    use HasFactory;

    protected $table = 'similarity_results';
    protected $primaryKey = 'similarity_result_id';
    public $timestamps = true;

    protected $fillable = [
        'source_paper_id',
        'compared_paper_id',
        'similarity_score',
        'breakdown_data',
        'checked_at'
    ];

    protected $casts = [
        'similarity_score' => 'float',
        'breakdown_data' => 'array',
        'checked_at' => 'datetime'
    ];

    /**
     * Relationship: Source Paper
     */
    public function sourcePaper()
    {
        return $this->belongsTo(ResearchPaper::class, 'source_paper_id', 'paper_id');
    }

    /**
     * Relationship: Compared Paper
     */
    public function comparedPaper()
    {
        return $this->belongsTo(ResearchPaper::class, 'compared_paper_id', 'paper_id');
    }

    /**
     * Get similarity level based on score
     */
    public function getSimilarityLevelAttribute()
    {
        if ($this->similarity_score >= 70) {
            return 'HIGH';
        } elseif ($this->similarity_score >= 50) {
            return 'MEDIUM';
        } else {
            return 'LOW';
        }
    }

    /**
     * Get matched sections if available
     */
    public function getMatchedSectionsAttribute()
    {
        if ($this->breakdown_data && isset($this->breakdown_data['section_based'])) {
            return $this->breakdown_data['section_based'];
        }
        return null;
    }
}