<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchPaper extends Model
{
    protected $primaryKey = 'paper_id';

    protected $fillable = [
        'school_id',
        'student_id',
        'adviser_id',
        'academic_year_id',
        'title',
        'abstract',
        'document_type',
        'pdf_path',
        'similarity_percentage',
        'status',
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
