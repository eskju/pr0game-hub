<?php

use App\Http\Controllers\AllianceController;
use App\Http\Controllers\BattleReportController;
use App\Http\Controllers\HubController;
use App\Http\Controllers\PlanetController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\SpyReportController;
use App\Models\Alliance;
use App\Models\Player;
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

Route::model('{alliance}', Alliance::class);
Route::model('{player}', Player::class);

Route::get('/login', PlayerController::class . '@login');
Route::post('/players/stats', PlayerController::class . '@stats');
Route::post('/players/overview', PlayerController::class . '@overview');
Route::post('/players/research', PlayerController::class . '@storeResearch');
Route::get('/players/{player}/planets', PlayerController::class . '@getPlanets');
Route::get('/players/chart', PlayerController::class . '@getPlayerChart');
Route::get('/players/{playerId}/chart', PlayerController::class . '@getPlayerChart');
Route::post('/players/{playerId}', PlayerController::class . '@store');

Route::get('/alliances/{alliance}/planets', AllianceController::class . '@getPlanets');

Route::post('/spy-reports', SpyReportController::class . '@store');
Route::get('/spy-reports/{galaxy}/{system}/{planet}', SpyReportController::class . '@history');

Route::post('/battle-reports', BattleReportController::class . '@store');

Route::get('/hub/planets', HubController::class . '@getBuildings');
Route::get('/hub/research', HubController::class . '@getResearch');
Route::get('/hub/fleet', HubController::class . '@getFleet');

Route::post('/planets', PlanetController::class . '@storePlanetId');
Route::post('/planets/buildings', PlanetController::class . '@storeBuildings');
Route::post('/planets/fleet', PlanetController::class . '@storeFleet');
