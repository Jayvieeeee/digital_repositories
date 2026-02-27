<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\ResearchPaperController;
use App\Http\Controllers\Api\ProgramController;

/* ================= PUBLIC AUTH ================= */

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-student', [AuthController::class, 'registerStudent']);
Route::post('/register-institution', [AuthController::class, 'registerInstitution']);

Route::post('/send-reset-code', [AuthController::class, 'sendResetCode']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/schools', [SchoolController::class, 'index']);

/* ================= PROTECTED ================= */

Route::middleware('auth:sanctum')->group(function () {

    /* ===== AUTH ===== */
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /* ===== PROGRAMS ===== */
    Route::get('/programs', [ProgramController::class, 'index']);

    /* ===== RESEARCH PAPERS ===== */
    Route::get('/research-papers', [ResearchPaperController::class, 'index']);
    Route::post('/research-papers', [ResearchPaperController::class, 'store']);
    Route::get('/research-papers/{id}', [ResearchPaperController::class, 'show']);
    Route::patch('/research-papers/{id}/status', [ResearchPaperController::class, 'updateStatus']);
    Route::get('/research-papers/{id}/download', [ResearchPaperController::class, 'download']);

    /* ===== STUDENT ===== */
    Route::prefix('student')->group(function () {

        // Dashboard
        Route::get('/dashboard', [StudentController::class, 'dashboard']);

        // Student's own submissions
        Route::get('/submissions-status', [StudentController::class, 'submissionsStatus']);

        // Access requests (both my requests and all access requests)
        Route::get('/access-requests', [StudentController::class, 'accessRequests']);
        Route::get('/my-requests', [StudentController::class, 'myRequests']);

        // Browse papers (public papers that student can view)
        Route::get('/papers', [StudentController::class, 'browse']);
        Route::get('/papers/{id}', [StudentController::class, 'show']);

        Route::post('/request/{id}', [StudentController::class, 'requestAccess']);
        Route::get('/requests', [StudentController::class, 'myRequests']);

        Route::get('/profile', [StudentController::class, 'profile']);
        Route::put('/profile', [StudentController::class, 'updateProfile']);
        Route::put('/password', [StudentController::class, 'updatePassword']);
    });

    /* ===== SCHOOL (if you have school routes) ===== */
    Route::prefix('school')->middleware('can:access-school')->group(function () {
        // Add school-specific routes here
    });
});
