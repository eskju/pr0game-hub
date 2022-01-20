<?php

use App\Http\Controllers\PlayerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/login', PlayerController::class . '@login');
Route::post('/players/stats', PlayerController::class . '@stats');
Route::post('/players/overview', PlayerController::class . '@overview');
Route::post('/players/{playerId}', PlayerController::class . '@store');
Route::post('/spy-reports', PlayerController::class . '@storeSpyReport');
Route::post('/planets', PlayerController::class . '@storePlanetId');
