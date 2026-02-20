<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $table = 'academic_years';
    protected $primaryKey = 'academic_year_id';
    public $timestamps = true;

    protected $fillable = [
        'year_start',
        'year_end',
        'is_current'
    ];

    protected $casts = [
        'year_start' => 'integer',
        'year_end' => 'integer',
        'is_current' => 'boolean',
    ];

    public function accessRequests()
    {
        return $this->hasMany(AccessRequest::class, 'academic_year_id', 'academic_year_id');
    }

    public function adviserSections()
    {
        return $this->hasMany(AdviserSection::class, 'academic_year_id', 'academic_year_id');
    }
}
