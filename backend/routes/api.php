<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DetectionController;
use App\Http\Controllers\LahanController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// --- Public routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Protected routes (butuh token Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile', [AuthController::class, 'updateProfile']);

    Route::apiResource('lahans', LahanController::class);

    Route::get('/detections/summary', [DetectionController::class, 'summary']); // taruh sebelum apiResource
    Route::apiResource('detections', DetectionController::class)->except(['update']);

    // --- Admin routes ---
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'index']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'destroy']);
        Route::patch('/admin/users/{user}/role', [AdminController::class, 'updateRole']);
    });
});