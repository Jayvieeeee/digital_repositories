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
        'program_id',
        'year_level',
        'uploaded_student_id',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function uploadedPapers()
    {
        return $this->hasMany(ResearchPaper::class, 'uploaded_student_id', 'student_id');
    }

    protected static function boot()
{
    parent::boot();

    static::updated(function ($student) {
        if ($student->isDirty('status')) {
            $student->user()->update([
                'status' => $student->status
            ]);
        }
    });
}
}
