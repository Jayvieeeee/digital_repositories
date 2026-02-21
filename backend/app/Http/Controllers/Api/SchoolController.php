<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;

class SchoolController extends Controller
{
    public function index()
    {
        $schools = School::where('status', 'approved')
            ->select('school_id', 'school_name')
            ->orderBy('school_name')
            ->get();

        return response()->json($schools);
    }
}