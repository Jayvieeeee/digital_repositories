<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessRequest extends Model
{
    use HasFactory;

    protected $table = 'access_request';
    protected $primaryKey = 'request_id';
    public $timestamps = true;

    protected $fillable = [
        'paper_id',
        'academic_year_id',
        'requesting_user_id',
        'request_message',
        'status',
        'remarks',
        'response_date'
    ];

    protected $casts = [
        'response_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Status constants
     */
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the research paper being requested
     */
    public function paper()
    {
        return $this->belongsTo(ResearchPaper::class, 'paper_id', 'paper_id');
    }

    /**
     * Get the user who made the request
     */
    public function requestingUser()
    {
        return $this->belongsTo(User::class, 'requesting_user_id', 'user_id');
    }

    /**
     * Get the student who made the request (through user)
     */
    public function requestingStudent()
    {
        return $this->hasOneThrough(
            Student::class,
            User::class,
            'user_id', // Foreign key on users table
            'user_id', // Foreign key on students table
            'requesting_user_id', // Local key on access_requests
            'user_id' // Local key on users
        );
    }

    /**
     * Get the academic year when request was made
     */
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }

    /**
     * Get the school of the requested paper
     */
    public function paperSchool()
    {
        return $this->hasOneThrough(
            School::class,
            ResearchPaper::class,
            'paper_id', // Foreign key on research_papers
            'school_id', // Foreign key on schools
            'paper_id', // Local key on access_requests
            'school_id' // Local key on research_papers
        );
    }

    /**
     * Scope a query to only include pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope a query to only include rejected requests
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Scope a query to only include requests from a specific user
     */
    public function scopeFromUser($query, $userId)
    {
        return $query->where('requesting_user_id', $userId);
    }

    /**
     * Scope a query to only include requests for a specific paper
     */
    public function scopeForPaper($query, $paperId)
    {
        return $query->where('paper_id', $paperId);
    }

    /**
     * Scope a query to only include requests from a specific academic year
     */
    public function scopeInAcademicYear($query, $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

    /**
     * Scope a query to only include requests that haven't been responded to yet
     */
    public function scopeUnresponded($query)
    {
        return $query->whereNull('response_date');
    }

    /**
     * Check if request is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if request is approved
     */
    public function isApproved()
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if request is rejected
     */
    public function isRejected()
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if request is cancelled
     */
    public function isCancelled()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Approve this request
     */
    public function approve($remarks = null)
    {
        $this->status = self::STATUS_APPROVED;
        $this->remarks = $remarks;
        $this->response_date = now();
        return $this->save();
    }

    /**
     * Reject this request
     */
    public function reject($remarks = null)
    {
        $this->status = self::STATUS_REJECTED;
        $this->remarks = $remarks;
        $this->response_date = now();
        return $this->save();
    }

    /**
     * Cancel this request
     */
    public function cancel($remarks = null)
    {
        $this->status = self::STATUS_CANCELLED;
        $this->remarks = $remarks;
        return $this->save();
    }

    /**
     * Get the formatted response date
     */
    public function getFormattedResponseDateAttribute()
    {
        return $this->response_date ? $this->response_date->format('M d, Y h:i A') : null;
    }

    /**
     * Get the formatted created date
     */
    public function getFormattedCreatedDateAttribute()
    {
        return $this->created_at->format('M d, Y h:i A');
    }

    /**
     * Get the status badge class for styling
     */
    public function getStatusBadgeClassAttribute()
    {
        return match($this->status) {
            self::STATUS_PENDING => 'badge bg-warning text-dark',
            self::STATUS_APPROVED => 'badge bg-success',
            self::STATUS_REJECTED => 'badge bg-danger',
            self::STATUS_CANCELLED => 'badge bg-secondary',
            default => 'badge bg-secondary'
        };
    }

    /**
     * Get the status label
     */
    public function getStatusLabelAttribute()
    {
        return ucfirst($this->status);
    }

    /**
     * Check if the request can be cancelled
     */
    public function canBeCancelled()
    {
        return $this->isPending();
    }

    /**
     * Check if the request can be responded to (approved/rejected)
     */
    public function canBeResponded()
    {
        return $this->isPending();
    }

    /**
     * Get the number of days since request was made
     */
    public function getDaysSinceRequestAttribute()
    {
        return $this->created_at->diffInDays(now());
    }

    /**
     * Get the response time in days (if responded)
     */
    public function getResponseTimeInDaysAttribute()
    {
        if (!$this->response_date) {
            return null;
        }
        
        return round($this->created_at->diffInDays($this->response_date), 1);
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Set default academic year if not provided
        static::creating(function ($request) {
            if (!$request->academic_year_id) {
                $activeYear = AcademicYear::where('is_active', true)->first();
                if ($activeYear) {
                    $request->academic_year_id = $activeYear->academic_year_id;
                }
            }
        });

        // Log when request is responded to
        static::updating(function ($request) {
            if ($request->isDirty('status') && in_array($request->status, [self::STATUS_APPROVED, self::STATUS_REJECTED])) {
                $request->response_date = now();
            }
        });
    }
}