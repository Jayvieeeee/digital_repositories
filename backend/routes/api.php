<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\ResearchPaperController;
use App\Http\Controllers\Api\ProgramController;

/* ================= AUTH ================= */

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-student', [AuthController::class, 'registerStudent']);
Route::post('/register-institution', [AuthController::class, 'registerInstitution']);

Route::post('/send-reset-code', [AuthController::class, 'sendResetCode']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/schools', [SchoolController::class, 'index']);


/* ================= PROTECTED ================= */

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/programs', [ProgramController::class, 'index']);

    /* ===== STUDENT ===== */

    Route::prefix('student')->group(function () {

        Route::get('/dashboard', [StudentController::class, 'dashboard']);
        Route::get('/submissions-status', [StudentController::class, 'submissionsStatus']);
        Route::get('/access-requests', [StudentController::class, 'accessRequests']);

        Route::get('/papers', [StudentController::class, 'browse']);
        Route::get('/papers/{id}', [StudentController::class, 'show']);

         Route::post('/research/upload', [ResearchPaperController::class, 'store']);

        Route::post('/request/{id}', [StudentController::class, 'requestAccess']);
        Route::get('/requests', [StudentController::class, 'myRequests']);

        Route::get('/profile', [StudentController::class, 'profile']);
        Route::put('/update-profile', [StudentController::class, 'updateProfile']);
        Route::put('/update-password', [StudentController::class, 'updatePassword']);
    });



});
