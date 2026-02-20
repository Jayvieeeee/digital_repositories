<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdviserSection extends Model
{
    use HasFactory;

    protected $table = 'advisor_sections';
    protected $primaryKey = 'adviser_section_id';
    public $timestamps = true;

    protected $fillable = [
        'adviser_id',
        'section_id',
        'academic_year_id'
    ];

    public function adviser()
    {
        return $this->belongsTo(Adviser::class, 'adviser_id', 'adviser_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id', 'section_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }
}
