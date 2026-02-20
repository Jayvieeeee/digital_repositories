<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students';
    protected $primaryKey = 'student_id';
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'section_id',
        'program',
        'year_level',
        'uploaded_student_id',
        'status'
    ];

    protected $casts = [
        'year_level' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id', 'section_id');
    }

    public function uploadedPapers()
    {
        return $this->hasMany(ResearchPaper::class, 'uploaded_student_id', 'student_id');
    }
}
