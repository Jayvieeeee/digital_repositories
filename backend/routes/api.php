<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register-student', [AuthController::class, 'registerStudent']);
Route::post('/register-institution', [AuthController::class, 'registerInstitution']);

Route::post('/send-reset-code', [AuthController::class, 'sendResetCode']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});