<?php

use App\Http\Controllers\BattleReportController;
use App\Http\Controllers\PlanetController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\SpyReportController;
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

Route::post('/spy-reports', SpyReportController::class . '@store');
Route::get('/spy-reports/{galaxy}/{system}/{planet}', SpyReportController::class . '@history');

Route::post('/battle-reports', BattleReportController::class . '@store');

Route::post('/planets', PlanetController::class . '@storePlanetId');
