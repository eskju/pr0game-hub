<?php

namespace App\Console\Commands;

use App\Models\Alliance;
use App\Models\LogPlayer;
use App\Models\Player;
use App\Models\PlayerScore;
use Carbon\Carbon;
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
        $ch = curl_init('https://pr0game.com/stats.json');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $html = curl_exec($ch);
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
            $player->score_building = $row->buildingScore;
            $player->score_science = $row->researchScore;
            $player->score_military = $row->fleetScore;
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
            $player->score_building = $row->buildingScore;
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

            $score = PlayerScore::query()->where('id', $row->playerId)->first() ?? new PlayerScore();
            $score->id = $row->playerId;
            $score->hour06 = $row->score - $this->getScore($score->player_id, Carbon::now()->subHours(6));
            $score->hour12 = $score->hour06 - $this->getScore($score->player_id, Carbon::now()->subHours(12));
            $score->hour18 = $score->hour12 - $this->getScore($score->player_id, Carbon::now()->subHours(18));
            $score->day01 = $row->score - $this->getScore($score->player_id, Carbon::now()->subdays(1));
            $score->day02 = $score->day01 - $this->getScore($score->player_id, Carbon::now()->subdays(2));
            $score->day03 = $score->day02 - $this->getScore($score->player_id, Carbon::now()->subdays(3));
            $score->day04 = $score->day03 - $this->getScore($score->player_id, Carbon::now()->subdays(4));
            $score->day05 = $score->day04 - $this->getScore($score->player_id, Carbon::now()->subdays(5));
            $score->day06 = $score->day05 - $this->getScore($score->player_id, Carbon::now()->subdays(6));
            $score->day07 = $score->day06 - $this->getScore($score->player_id, Carbon::now()->subdays(7));
            $score->save();
        }
    }

    private function getScore(int $playerId, Carbon $dateTime)
    {
        return LogPlayer::query()
                ->where('external_id', $playerId)
                ->where('created_at', '<=', $dateTime)
                ->orderBy('created_at', 'DESC')
                ->first()
                ->score ?? 0;
    }
}
