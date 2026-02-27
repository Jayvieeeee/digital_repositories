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

    protected $casts = [
        'year_level' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user account associated with this student
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the program this student is enrolled in
     */
    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id', 'program_id');
    }

    /**
     * Get all research papers uploaded by this student
     */
    public function researchPapers()
    {
        return $this->hasMany(ResearchPaper::class, 'student_id', 'student_id');
    }

    /**
     * Get access requests made by this student
     */
    public function accessRequests()
    {
        return $this->hasMany(AccessRequest::class, 'requesting_user_id', 'user_id');
    }

    /**
     * Get the school of this student through user relationship
     */
    public function school()
    {
        return $this->hasOneThrough(
            School::class,
            User::class,
            'user_id', // Foreign key on users table
            'school_id', // Foreign key on schools table
            'user_id', // Local key on students table
            'school_id' // Local key on users table
        );
    }

    /**
     * Get pending research papers
     */
    public function pendingPapers()
    {
        return $this->researchPapers()->where('status', 'pending');
    }

    /**
     * Get approved research papers
     */
    public function approvedPapers()
    {
        return $this->researchPapers()->where('status', 'approved');
    }

    /**
     * Get rejected research papers
     */
    public function rejectedPapers()
    {
        return $this->researchPapers()->where('status', 'rejected');
    }

    /**
     * Get papers that need revision
     */
    public function needsRevisionPapers()
    {
        return $this->researchPapers()->where('status', 'needs_revision');
    }

    /**
     * Check if student has any pending papers
     */
    public function hasPendingPapers()
    {
        return $this->pendingPapers()->exists();
    }

    /**
     * Get total number of uploads
     */
    public function getTotalUploadsAttribute()
    {
        return $this->researchPapers()->count();
    }

    /**
     * Get average similarity score
     */
    public function getAverageSimilarityAttribute()
    {
        return round($this->researchPapers()->avg('similarity_percentage') ?? 0, 2);
    }

    /**
     * Get full name from associated user
     */
    public function getFullNameAttribute()
    {
        return $this->user ? $this->user->first_name . ' ' . $this->user->last_name : null;
    }

    /**
     * Get email from associated user
     */
    public function getEmailAttribute()
    {
        return $this->user ? $this->user->email : null;
    }

    /**
     * Scope a query to only include active students
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include students in a specific program
     */
    public function scopeInProgram($query, $programId)
    {
        return $query->where('program_id', $programId);
    }

    /**
     * Scope a query to only include students in a specific year level
     */
    public function scopeInYearLevel($query, $yearLevel)
    {
        return $query->where('year_level', $yearLevel);
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // When student status is updated, update user status
        static::updated(function ($student) {
            if ($student->isDirty('status')) {
                $student->user()->update([
                    'status' => $student->status
                ]);
            }
        });

        // When student is created, ensure user exists
        static::creating(function ($student) {
            if (!$student->user_id) {
                throw new \Exception('Student must be associated with a user');
            }
        });

        // When student is deleted, optionally handle related records
        static::deleting(function ($student) {
            // Option 1: Prevent deletion if has papers
            if ($student->researchPapers()->exists()) {
                throw new \Exception('Cannot delete student with existing research papers');
            }
            
            // Option 2: Cascade delete or nullify
            // $student->researchPapers()->update(['student_id' => null]);
        });
    }

    /**
     * Get the route key for the model
     */
    public function getRouteKeyName()
    {
        return 'student_id';
    }
}