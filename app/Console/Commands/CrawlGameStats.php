<?php

namespace App\Console\Commands;

use App\Models\GameStats;
use App\Models\Planet;
use App\Models\Player;
use Illuminate\Console\Command;

class CrawlGameStats extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'crawl:game-stats';

    /**
     * The console command description.
     * @var string
     */
    protected $description = '';

    public function handle()
    {
        $item = new GameStats();
        $item->universe = 1;
        $item->galaxy = null;
        $item->players_total = Player::query()->count();
        $item->players_inactive = Player::query()->where('is_inactive', 1)->count();
        $item->players_vacation = Player::query()->where('on_vacation', 1)->count();
        $item->players_active = Player::query()->where('is_inactive', 0)->where('on_vacation', 0)->count();
        $item->planets_total = Planet::query()->join('players', 'players.id', '=', 'planets.player_id')->count();
        $item->planets_inactive = Planet::query()->join('players', 'players.id', '=', 'planets.player_id')->where('is_inactive', 1)->count();
        $item->planets_vacation = Planet::query()->join('players', 'players.id', '=', 'planets.player_id')->where('on_vacation', 1)->count();
        $item->planets_active = Planet::query()->join('players', 'players.id', '=', 'planets.player_id')->where('is_inactive', 0)->where('on_vacation', 0)->count();
        $item->datetime = date('Y-m-d H') . ':00:00';
        $item->save();

        for ($g = 1; $g <= 9; $g++) {
            $item = new GameStats();
            $item->universe = 1;
            $item->galaxy = $g;
            $item->players_total = Player::query()->join('planets', 'planets.player_id', '=', 'players.id')->where('galaxy', $g)->count();
            $item->players_inactive = Player::query()->join('planets', 'planets.player_id', '=', 'players.id')->where('galaxy', $g)->where('is_inactive', 1)->count();
            $item->players_vacation = Player::query()->join('planets', 'planets.player_id', '=', 'players.id')->where('galaxy', $g)->where('on_vacation', 1)->count();
            $item->players_active = Player::query()->join('planets', 'planets.player_id', '=', 'players.id')->where('galaxy', $g)->where('is_inactive', 0)->where('on_vacation', 0)->count();
            $item->planets_total = Planet::query()->where('galaxy', $g)->join('players', 'players.id', '=', 'planets.player_id')->count();
            $item->planets_inactive = Planet::query()->join('players', 'players.id', '=', 'planets.player_id')->where('galaxy', $g)->where('is_inactive', 1)->count();
            $item->planets_vacation = Planet::query()->join('players', 'players.id', '=', 'planets.player_id')->where('galaxy', $g)->where('on_vacation', 1)->count();
            $item->planets_active = Planet::query()->join('players', 'players.id', '=', 'planets.player_id')->where('galaxy', $g)->where('is_inactive', 0)->where('on_vacation', 0)->count();
            $item->datetime = date('Y-m-d H') . ':00:00';
            $item->save();
        }
    }
}
