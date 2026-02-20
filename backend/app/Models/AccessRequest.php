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
    ];

    public function paper()
    {
        return $this->belongsTo(ResearchPaper::class, 'paper_id', 'paper_id');
    }

    public function requestingUser()
    {
        return $this->belongsTo(User::class, 'requesting_user_id', 'user_id');
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id', 'academic_year_id');
    }
}
