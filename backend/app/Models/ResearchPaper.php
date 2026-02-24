<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchPaper extends Model
{
    protected $primaryKey = 'paper_id';

     protected $fillable = [
        'reference_number',
        'school_id',
        'student_id',
        'program_id',
        'academic_year_id',
        'title',
        'abstract',
        'document_type',
        'similarity_percentage',
        'pdf_path',
        'status',
        'approved_at',
    ];

    /* relations */

    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }

    public function requests()
    {
        return $this->hasMany(AccessRequest::class, 'paper_id');
    }
}
