<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $table = 'sections';
    protected $primaryKey = 'section_id';
    public $timestamps = true;

    protected $fillable = [
        'school_id',
        'section_name'
    ];

    public function school()
    {
        return $this->belongsTo(School::class, 'school_id', 'school_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'section_id', 'section_id');
    }

    public function adviserSections()
    {
        return $this->hasMany(AdviserSection::class, 'section_id', 'section_id');
    }
}
