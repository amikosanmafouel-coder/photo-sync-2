<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

#Route::get('/user', function (Request $request) {
#    return $request->user();
#})->middleware('auth:sanctum');

Route::get('/test', function () {
    return response()->json(['message' => 'Hello from Cloud Shell Backend!']);
});

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Require Login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Return the currently logged-in user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
