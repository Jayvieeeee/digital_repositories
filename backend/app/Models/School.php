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

    public function users()
    {
        return $this->hasMany(User::class, 'school_id', 'school_id');
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
