<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    /**
     * Display list of programs
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Only get programs from the user's school
        $programs = Program::where('school_id', $user->school_id)
            ->select('program_id', 'program_name')
            ->get();

        return response()->json($programs);
    }
}