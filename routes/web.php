<?php

use App\Http\Controllers\AllianceController;
use App\Http\Controllers\BattleReportController;
use App\Http\Controllers\ExpeditionController;
use App\Http\Controllers\FlightController;
use App\Http\Controllers\GalaxyController;
use App\Http\Controllers\HostileSpyingController;
use App\Http\Controllers\HubController;
use App\Http\Controllers\PlanetController;
use App\Http\Controllers\PlanetImagesController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\SpyReportController;
use App\Models\Alliance;
use App\Models\Planet;
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

Route::get('live-score', function () {
    $score = 0;
    $score += Planet::query()->where('player_id', 1029)->sum('score_building');
    $score += Planet::query()->where('player_id', 1029)->sum('score_defense');
    $score += Planet::query()->where('player_id', 1029)->sum('score_military');
    $score += Player::query()->where('id', 1029)->sum('score_science');
    $oldScore = Player::query()->where('id', 1029)->sum('score');
    $diff = $score - $oldScore;

    echo '<pre>';
    echo 'pr0game: ' . number_format($oldScore, 0, '', '.') . PHP_EOL;
    echo 'neu:     ' . number_format($score, 0, '', '.') . PHP_EOL;
    echo 'diff:    ' . ($diff > 0 ? '+' : '') . number_format($diff, 0, '', '.');
    echo '</pre>';
});

Route::get('planet-images', PlanetImagesController::class . '@index');
Route::get('/login', PlayerController::class . '@login');
Route::post('/players/stats', PlayerController::class . '@stats');
Route::post('/players/overview', PlayerController::class . '@overview');
Route::post('/players/research', PlayerController::class . '@storeResearch');
Route::get('/players/{player}/planets', PlayerController::class . '@getPlanets');
Route::get('/players/chart', PlayerController::class . '@getOwnPlayerChart');
Route::get('/players/{player}/chart', PlayerController::class . '@getPlayerChart');
Route::post('/players/{playerId}', PlayerController::class . '@store');
Route::post('/players/{playerId}/delete', PlayerController::class . '@delete');

Route::get('/alliances/{alliance}/planets', AllianceController::class . '@getPlanets');
Route::get('/alliances/{alliance}/chart', AllianceController::class . '@getChart');

Route::post('/spy-reports', SpyReportController::class . '@store');
Route::get('/spy-reports/{galaxy}/{system}/{planet}', SpyReportController::class . '@history');

Route::post('/battle-reports', BattleReportController::class . '@store');

Route::get('/hub/planets', HubController::class . '@getBuildings');
Route::get('/hub/research', HubController::class . '@getResearch');
Route::get('/hub/transfer-matrix', HubController::class . '@getTransferMatrix');
Route::get('/hub/fleet', HubController::class . '@getFleet');
Route::get('/hub/galaxy', HubController::class . '@getGalaxyViewStatus');
Route::get('/hub/scores', HubController::class . '@getScores');
Route::get('/hub/galaxy-alliances', HubController::class . '@getAlliancePowerOverview');

Route::post('/planets', PlanetController::class . '@storePlanetId');
Route::post('/planets/buildings', PlanetController::class . '@storeBuildings');
Route::post('/planets/fleet', PlanetController::class . '@storeFleet');
Route::get('/galaxy/{galaxy}/{system}', GalaxyController::class . '@show');

Route::post('/expeditions', ExpeditionController::class . '@store');

Route::post('/flights', FlightController::class . '@store');
Route::get('/flights/stats', FlightController::class . '@stats');
Route::get('/debug/flights', FlightController::class . '@fixFlightDiffs');

Route::post('/hostile-spying', HostileSpyingController::class . '@store');
Route::get('/hostile-spying', HostileSpyingController::class . '@index');
