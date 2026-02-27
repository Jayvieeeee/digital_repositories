<?php

use Illuminate\Support\Facades\Route;
use App\Models\ResearchPaper;
use App\Services\SimilarityService;

Route::get('/', function () {
    return view('welcome');
});
