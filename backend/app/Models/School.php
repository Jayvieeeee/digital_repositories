<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Mail\SchoolApprovedMail;
use Illuminate\Support\Facades\Mail;

class School extends Model
{
    protected $primaryKey = 'school_id';

    protected $fillable = [
        'school_name',
        'school_address',
        'school_type',
        'contact_number',
        'email',
        'proof_of_legitimacy',
        'status',
    ];

    /**
     * Get all users belonging to this school
     */
    public function users()
    {
        return $this->hasMany(User::class, 'school_id', 'school_id');
    }

    /**
     * Get all research papers from this school
     */
    public function researchPapers()
    {
        return $this->hasMany(ResearchPaper::class, 'school_id', 'school_id');
    }

    /**
     * Get all students enrolled in this school (through sections)
     */
    public function students()
    {
        return $this->hasManyThrough(
            Student::class,
            'school_id', // Foreign key on sections table
            'school_id', // Local key on schools table
        );
    }


    /**
     * Get count of pending papers from this school
     */
    public function getPendingPapersCountAttribute()
    {
        return $this->researchPapers()->where('status', 'pending')->count();
    }

    /**
     * Get count of approved papers from this school
     */
    public function getApprovedPapersCountAttribute()
    {
        return $this->researchPapers()->where('status', 'approved')->count();
    }

    /**
     * Get count of published papers from this school
     */
    public function getPublishedPapersCountAttribute()
    {
        return $this->researchPapers()->where('status', 'published')->count();
    }

    /**
     * Get total number of students in this school
     */
    public function getTotalStudentsAttribute()
    {
        return $this->students()->count();
    }

    /**
     * Get total number of advisers in this school
     */
    public function getTotalAdvisersAttribute()
    {
        return $this->advisers()->count();
    }

    /**
     * Check if school is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if school is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if school is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    // Send email when school is approved
    protected static function booted()
    {
        static::updated(function ($school) {
            if ($school->isDirty('status') && $school->status === 'approved') {
                Mail::send(new SchoolApprovedMail($school));
            }
        });
    }
}
