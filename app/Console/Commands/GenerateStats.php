<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateStats extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'generate:stats';

    /**
     * The console command description.
     * @var string
     */
    protected $description = '';

    public function handle()
    {
        echo '${f.riesig}${c.orange}pr0game in Zahlen' . PHP_EOL;
        echo '${f.normal}${c.schwuchtel}13.05. - 20.05.2022 (Urlaubsvertretung)' . PHP_EOL;

        $this->echoGalaStats();
        $this->echoAlliancePlayerStats();
        $this->echoBattleStats();
        $this->echoMisc();

        echo '${c.pr0mium}${f.gross}Serverstats:' . PHP_EOL;
        echo '${f.normal}${c.neu}Aufrufe: ${c.schwuchtel}19,35 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}Deutschland: ${c.schwuchtel}17,1 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}Österreich: ${c.schwuchtel}1,26 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}Schweiz: ${c.schwuchtel}568k' . PHP_EOL;
        echo PHP_EOL;

        echo '${c.pr0mium}${f.gross}Browser:' . PHP_EOL;
        echo '${f.normal}${c.neu}Firefox: ${c.schwuchtel}6,27 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}Chrome (mobil): ${c.schwuchtel}6,267 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}Safari (mobil): ${c.schwuchtel}2,391 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}Chrome: ${c.schwuchtel}2,364 Millionen' . PHP_EOL;
        echo PHP_EOL;

        echo '${c.pr0mium}${f.gross}OS:' . PHP_EOL;
        echo '${f.normal}${c.neu}Android: ${c.schwuchtel}9,067 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}Windows: ${c.schwuchtel}6,126 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}iOS: ${c.schwuchtel}2,698 Millionen' . PHP_EOL;
        echo '${f.normal}${c.neu}Linux: ${c.schwuchtel}350k' . PHP_EOL;
        echo PHP_EOL;

        echo '${c.pr0mium}${f.gross}FF (pr0game HUB Stats):' . PHP_EOL;
        echo '${f.normal}${c.neu}Aufrufe (7 Tage): ${c.schwuchtel}60.502' . PHP_EOL;
        echo '${f.normal}${c.neu}Spionageberichte: ${c.schwuchtel}76.415' . PHP_EOL;
        echo '${f.normal}${c.neu}Kampfberichte: ${c.schwuchtel}21.333' . PHP_EOL;
        echo '${f.normal}${c.neu}Expeditionen: ${c.schwuchtel}25.196' . PHP_EOL;
        echo PHP_EOL;

    }

    private function echoGalaStats()
    {
        echo '${c.pr0mium}${f.gross}Punktedurchschnitt (aktive Spieler)' . PHP_EOL;
        $res = DB::selectOne('
            SELECT COUNT(1) as players,
                   (SELECT COUNT(1) FROM players s WHERE is_inactive = 1) as inactive,
                   (SELECT COUNT(1) FROM players s WHERE on_vacation = 1) as vacation,
                   ROUND(AVG(score)) AS score,
                   AVG(score_building) AS score_building,
                   AVG(score_science) AS score_science,
                   AVG(score_military) AS score_military,
                   AVG(score_defense) AS score_defense,
                   SUBSTRING(p.main_coordinates,1,1) AS gala
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
            WHERE is_inactive = 0
              AND on_vacation = 0;
      ');

        echo '${f.normal}${c.neu}Global: ' . $res->players . ' Spieler aktiv (' . $res->vacation . ' Urlauber, ' . $res->inactive . ' Inaktive):' . PHP_EOL;
        echo '${c.alt}' . number_format($res->score, 0, '', '.') . ' Punkte, ${c.mod}' . number_format($res->score_building, 0, '', '.') . ' Gebäude, ${c.mittel}' . number_format($res->score_science, 0, '', '.') . ' Forschung, ${c.admin}' . number_format($res->score_military, 0, '', '.') . ' Flotte, ${c.alt-mod}' . number_format($res->score_defense, 0, '', '.') . ' Verteidigung' . PHP_EOL;

        $rows = DB::select('
            SELECT COUNT(1) as players,
                   (SELECT COUNT(1) FROM players s WHERE is_inactive = 1 AND SUBSTRING(s.main_coordinates,1,1) = SUBSTRING(p.main_coordinates,1,1)) as inactive,
                   (SELECT COUNT(1) FROM players s WHERE on_vacation = 1 AND SUBSTRING(s.main_coordinates,1,1) = SUBSTRING(p.main_coordinates,1,1)) as vacation,
                   ROUND(AVG(score)) AS score,
                   AVG(score_building) AS score_building,
                   AVG(score_science) AS score_science,
                   AVG(score_military) AS score_military,
                   AVG(score_defense) AS score_defense,
                   SUBSTRING(p.main_coordinates,1,1) AS gala
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
            WHERE is_inactive = 0
              AND on_vacation = 0
            GROUP BY SUBSTRING(p.main_coordinates,1,1);
      ');

        foreach ($rows as $res) {
            echo '${f.normal}${c.neu}Main-Gala ' . $res->gala . ': ' . $res->players . ' Spieler aktiv (' . $res->inactive . ' Urlauber, ' . $res->inactive . ' Inaktive):' . PHP_EOL;
            echo '${c.alt}' . number_format($res->score, 0, '', '.') . ' Punkte, ${c.mod}' . number_format($res->score_building, 0, '', '.') . ' Gebäude, ${c.mittel}' . number_format($res->score_science, 0, '', '.') . ' Forschung, ${c.admin}' . number_format($res->score_military, 0, '', '.') . ' Flotte, ${c.alt-mod}' . number_format($res->score_defense, 0, '', '.') . ' Verteidigung' . PHP_EOL;
        }
    }

    private function echoAlliancePlayerStats()
    {
        echo PHP_EOL . '${c.pr0mium}${f.gross}Top 5 Allianzen & Spieler je Galaxie (aktive Spieler)' . PHP_EOL;
        for ($g = 1; $g <= 9; $g++) {
            $rows = DB::select('
            SELECT COUNT(1) as players,
                   a.name,
                   (SELECT COUNT(1) FROM players s WHERE is_inactive = 1 AND SUBSTRING(s.main_coordinates,1,1) = SUBSTRING(p.main_coordinates,1,1)) as inactive,
                   (SELECT COUNT(1) FROM players s WHERE on_vacation = 1 AND SUBSTRING(s.main_coordinates,1,1) = SUBSTRING(p.main_coordinates,1,1)) as vacation,
                   ROUND(SUM(score)) AS score,
                   SUM(score_building) AS score_building,
                   SUM(score_science) AS score_science,
                   SUM(score_military) AS score_military,
                   SUM(score_defense) AS score_defense,
                   SUBSTRING(p.main_coordinates,1,1) AS gala
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                INNER JOIN alliances a
                    ON p.alliance_id = a.id
            WHERE is_inactive = 0
              AND on_vacation = 0
              AND SUBSTRING(p.main_coordinates,1,1) = ' . $g . '
            GROUP BY p.alliance_id
            ORDER BY SUBSTRING(p.main_coordinates,1,1),SUM(score) DESC
            LIMIT 5;
            ');

            echo '${f.normal}${c.schwuchtel}Allianzen Gala ' . $g . ':' . PHP_EOL;
            foreach ($rows as $res) {
                echo '${c.neu}' . $res->name . ': ${c.alt}' . number_format($res->score, 0, '', '.') . ' Punkte, ${c.mod}' . number_format($res->score_building, 0, '', '.') . ' Gebäude, ${c.mittel}' . number_format($res->score_science, 0, '', '.') . ' Forschung, ${c.admin}' . number_format($res->score_military, 0, '', '.') . ' Flotte, ${c.alt-mod}' . number_format($res->score_defense, 0, '', '.') . ' Verteidigung' . PHP_EOL;
            }
            echo PHP_EOL;
        }

        for ($g = 1; $g <= 9; $g++) {
            $rows = DB::select('
            SELECT COUNT(1) as players,
                   p.name as playerName,
                   a.name,
                   (SELECT COUNT(1) FROM players s WHERE is_inactive = 1 AND SUBSTRING(s.main_coordinates,1,1) = SUBSTRING(p.main_coordinates,1,1)) as inactive,
                   (SELECT COUNT(1) FROM players s WHERE on_vacation = 1 AND SUBSTRING(s.main_coordinates,1,1) = SUBSTRING(p.main_coordinates,1,1)) as vacation,
                   ROUND(SUM(score)) AS score,
                   SUM(score_building) AS score_building,
                   SUM(score_science) AS score_science,
                   SUM(score_military) AS score_military,
                   SUM(score_defense) AS score_defense,
                   SUBSTRING(p.main_coordinates,1,1) AS gala
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                INNER JOIN alliances a
                    ON p.alliance_id = a.id
            WHERE is_inactive = 0
              AND on_vacation = 0
              AND SUBSTRING(p.main_coordinates,1,1) = ' . $g . '
            GROUP BY p.id
            ORDER BY SUBSTRING(p.main_coordinates,1,1),SUM(score) DESC
            LIMIT 5;
            ');

            echo '${f.normal}${c.schwuchtel}Spieler Gala ' . $g . ':' . PHP_EOL;
            foreach ($rows as $res) {
                echo '${c.neu}' . $res->playerName . ' [' . $res->name . ']: ${c.alt}' . number_format($res->score, 0, '', '.') . ' Punkte, ${c.mod}' . number_format($res->score_building, 0, '', '.') . ' Gebäude, ${c.mittel}' . number_format($res->score_science, 0, '', '.') . ' Forschung, ${c.admin}' . number_format($res->score_military, 0, '', '.') . ' Flotte, ${c.alt-mod}' . number_format($res->score_defense, 0, '', '.') . ' Verteidigung' . PHP_EOL;
            }
            echo PHP_EOL;
        }
    }

    private function echoBattleStats()
    {
        echo '${c.pr0mium}${f.gross}Kampfwertungen' . PHP_EOL;
        $rows = DB::select('
            SELECT COUNT(1) as players,
                   p.name as playerName,
                   a.name,
                   p.units_shot
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                INNER JOIN alliances a
                    ON p.alliance_id = a.id
            WHERE is_inactive = 0
              AND on_vacation = 0
            GROUP BY p.id
            ORDER BY p.units_shot DESC
            LIMIT 5;
            ');

        echo '${f.normal}${c.schwuchtel}Zerstörte Einheiten:' . PHP_EOL;
        foreach ($rows as $res) {
            echo '${c.neu}' . $res->playerName . ' [' . $res->name . ']: ${c.alt}' . number_format($res->units_shot, 0, '', '.') . ' Einheiten' . PHP_EOL;
        }
        echo PHP_EOL;

        $rows = DB::select('
            SELECT COUNT(1) as players,
                   p.name as playerName,
                   a.name,
                   p.units_lost
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                INNER JOIN alliances a
                    ON p.alliance_id = a.id
            WHERE is_inactive = 0
              AND on_vacation = 0
            GROUP BY p.id
            ORDER BY p.units_lost DESC
            LIMIT 5;
            ');

        echo '${f.normal}${c.schwuchtel}Verlorene Einheiten:' . PHP_EOL;
        foreach ($rows as $res) {
            echo '${c.neu}' . $res->playerName . ' [' . $res->name . ']: ${c.alt}' . number_format($res->units_lost, 0, '', '.') . ' Einheiten' . PHP_EOL;
        }
        echo PHP_EOL;

        echo '${f.normal}${c.schwuchtel}Zerstörte/verlorene Einheiten seit letzer Woche:' . PHP_EOL;
        echo 'Woher soll ich das wissen? Bin hier nur die Vertretung' . PHP_EOL . PHP_EOL;

        $rows = DB::select('
            SELECT COUNT(1) as players,
                   p.name as playerName,
                   a.name,
                   p.units_shot
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                INNER JOIN alliances a
                    ON p.alliance_id = a.id
            GROUP BY a.id
            ORDER BY p.units_shot DESC
            LIMIT 5;
            ');

        echo '${f.normal}${c.schwuchtel}Zerstörte Einheiten je Allianz:' . PHP_EOL;
        foreach ($rows as $res) {
            echo '${c.neu}' . $res->name . ': ${c.alt}' . number_format($res->units_shot, 0, '', '.') . ' Einheiten' . PHP_EOL;
        }
        echo PHP_EOL;

        $rows = DB::select('
            SELECT COUNT(1) as players,
                   p.name as playerName,
                   a.name,
                   p.units_lost
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                INNER JOIN alliances a
                    ON p.alliance_id = a.id
            GROUP BY a.id
            ORDER BY p.units_lost DESC
            LIMIT 5;
            ');

        echo '${f.normal}${c.schwuchtel}Verlorene Einheiten je Allianz:' . PHP_EOL;
        foreach ($rows as $res) {
            echo '${c.neu}' . $res->name . ': ${c.alt}' . number_format($res->units_lost, 0, '', '.') . ' Einheiten' . PHP_EOL;
        }
        echo PHP_EOL;
    }

    private function echoMisc()
    {
        echo '${c.pr0mium}${f.gross}Sonstiges' . PHP_EOL;
        $rows = DB::select('
            SELECT COUNT(1) as players,
                   p.name as playerName,
                   a.name,
                   p.score
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                INNER JOIN alliances a
                    ON p.alliance_id = a.id
            WHERE is_inactive = 0
              AND on_vacation = 0
            AND p.name LIKE "%Luke%"
            GROUP BY p.id
            ORDER BY p.score DESC
            LIMIT 5;
            ');

        echo '${f.normal}${c.schwuchtel}Die größten Lukes:' . PHP_EOL;
        foreach ($rows as $res) {
            echo '${c.neu}' . $res->playerName . ' [' . $res->name . ']: ${c.alt}' . number_format($res->score, 0, '', '.') . ' Punkte' . PHP_EOL;
        }
        echo PHP_EOL;

        echo '${c.pr0mium}${f.gross}Größter Punktezuwachs' . PHP_EOL;
        for ($d = 1; $d <= 7; $d++) {
            $rows = DB::select('
            SELECT COUNT(1) as players,
                   p.name as playerName,
                   a.name,
                   p.score - day0' . $d . ' as score
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                LEFT OUTER JOIN alliances a
                    ON p.alliance_id = a.id
            GROUP BY p.id
            ORDER BY (p.score - day0' . $d . ') DESC
            LIMIT 5;
            ');

            echo '${f.normal}${c.schwuchtel}' . $d . ' Tag' . ($d > 1 ? 'e' : '') . ': ' . PHP_EOL;
            foreach ($rows as $res) {
                echo '${c.neu}' . $res->playerName . ' [' . ($res->name ?? '---') . ']: ${c.alt}' . number_format($res->score, 0, '', '.') . ' Punkte' . PHP_EOL;
            }
            echo PHP_EOL;
        }

        echo '${c.pr0mium}${f.gross}Größter Punkteverlust' . PHP_EOL;
        for ($d = 1; $d <= 7; $d++) {
            $rows = DB::select('
            SELECT COUNT(1) as players,
                   p.name as playerName,
                   a.name,
                   p.score - day0' . $d . ' as score
            FROM `player_scores` ps
                INNER JOIN players p
                    ON p.id = ps.id
                LEFT OUTER JOIN alliances a
                    ON p.alliance_id = a.id
            GROUP BY p.id
            ORDER BY (p.score - day0' . $d . ') ASC
            LIMIT 5;
            ');

            echo '${f.normal}${c.schwuchtel}' . $d . ' Tag' . ($d > 1 ? 'e' : '') . ': ' . PHP_EOL;
            foreach ($rows as $res) {
                echo '${c.neu}' . $res->playerName . ' [' . ($res->name ?? '---') . ']: ${c.alt}' . number_format($res->score, 0, '', '.') . ' Punkte' . PHP_EOL;
            }
            echo PHP_EOL;
        }
    }

}
