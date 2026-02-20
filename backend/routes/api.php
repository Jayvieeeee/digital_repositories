<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;

/* ================= AUTH ================= */

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-student', [AuthController::class, 'registerStudent']);
Route::post('/register-institution', [AuthController::class, 'registerInstitution']);

Route::post('/send-reset-code', [AuthController::class, 'sendResetCode']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


/* ================= PROTECTED ================= */

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /* ===== STUDENT ===== */

    Route::prefix('student')->group(function () {

        Route::get('/dashboard', [StudentController::class, 'dashboardSummary']);

        Route::get('/papers', [StudentController::class, 'browse']);
        Route::get('/papers/{id}', [StudentController::class, 'show']);

        Route::post('/upload', [StudentController::class, 'upload']);

        Route::post('/request/{id}', [StudentController::class, 'requestAccess']);
        Route::get('/requests', [StudentController::class, 'myRequests']);
    });
});
