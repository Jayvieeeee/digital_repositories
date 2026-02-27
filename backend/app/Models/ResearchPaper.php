<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchPaper extends Model
{
    protected $table = 'research_papers';
    protected $primaryKey = 'paper_id';
    public $incrementing = true;

    protected $fillable = [
        'reference_number',
        'school_id',
        'student_id',
        'program_id',
        'academic_year_id',
        'title',
        'abstract',
        'document_type',
        'pdf_path',
        'raw_text',
        'cleaned_text',
        'similarity_percentage',
        'status'
    ];

    protected $casts = [
        'similarity_percentage' => 'float'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id', 'student_id');
    }

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }
}