<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Adviser extends Model
{
    use HasFactory;

    protected $table = 'advisers';
    protected $primaryKey = 'adviser_id';
    public $timestamps = true;

    protected $fillable = [
        'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function adviserSections()
    {
        return $this->hasMany(AdviserSection::class, 'adviser_id', 'adviser_id');
    }

    public function sections()
    {
        return $this->belongsToMany(Section::class, 'advisor_sections', 'adviser_id', 'section_id')
            ->withPivot('academic_year_id')
            ->withTimestamps();
    }
}
