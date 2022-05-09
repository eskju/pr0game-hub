<?php

namespace App\Console\Commands;

use App\Models\Alliance;
use App\Models\LogPlayer;
use App\Models\Player;
use Illuminate\Console\Command;

class CrawlPlayerStats extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'crawl:player-stats';

    /**
     * The console command description.
     * @var string
     */
    protected $description = '';

    /**
     * Create a new command instance.
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        ini_set('allow_url_fopen', true);

        $html = file_get_contents('https://pr0game.com/stats.json');
        $json = json_decode($html);

        $bar = $this->output->createProgressBar(count($json));

        foreach ($json as $row) {
            $bar->advance();

            if ($row->allianceId) {
                if (!$alliance = Alliance::query()->find($row->allianceId)) {
                    $alliance = new Alliance();
                    $alliance->id = $row->allianceId;
                    $alliance->name = $row->allianceName ?: '---';
                    $alliance->tag = $row->allianceName ?: '---';
                    $alliance->save();
                } else {
                    $alliance->name = $row->allianceName ?: '---';
                    $alliance->save();
                }
            }

            /** @var Player */
            if (!$player = Player::query()->find($row->playerId)) {
                $player = new Player();
                $player->id = $row->playerId;
            }

            $player->score = $row->score;
            $player->score_building = $row->score;
            $player->score_science = $row->researchScore;
            $player->score_military = $row->fleetScore;
            $player->score_defense = $row->defensiveScore;
            $player->score_defense = $row->defensiveScore;
            $player->combats_total = $row->battlesWon + $row->battlesDraw + $row->battlesLost;
            $player->combats_won = $row->battlesWon;
            $player->combats_draw = $row->battlesDraw;
            $player->combats_lost = $row->battlesLost;
            $player->units_shot = $row->unitsDestroyed;
            $player->units_lost = $row->unitsLost;
            $player->rubble_metal = $row->debrisMetal;
            $player->rubble_crystal = $row->debrisCrystal;
            $player->alliance_id = isset($alliance) ? $alliance->id : null;
            $player->save();

            $player = new LogPlayer();
            $player->external_id = $row->playerId;
            $player->reported_by = 1;
            $player->name = $row->playerName;
            $player->main_coordinates = '';
            $player->score = $row->score;
            $player->score_building = $row->score;
            $player->score_science = $row->researchScore;
            $player->score_military = $row->fleetScore;
            $player->score_defense = $row->defensiveScore;
            $player->score_defense = $row->defensiveScore;
            $player->combats_total = $row->battlesWon + $row->battlesDraw + $row->battlesLost;
            $player->combats_won = $row->battlesWon;
            $player->combats_draw = $row->battlesDraw;
            $player->combats_lost = $row->battlesLost;
            $player->units_shot = $row->unitsDestroyed;
            $player->units_lost = $row->unitsLost;
            $player->rubble_metal = $row->debrisMetal;
            $player->rubble_crystal = $row->debrisCrystal;
            $player->alliance_id = isset($alliance) ? $alliance->id : null;
            $player->save();
        }
    }
}
