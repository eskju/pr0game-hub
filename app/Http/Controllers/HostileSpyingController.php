<?php

namespace App\Http\Controllers;

use App\Models\HostileSpying;
use App\Models\Planet;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HostileSpyingController extends Controller
{
    public function index()
    {
        $return = HostileSpying::query()
            ->select([
                DB::raw('hostile_spying.*'),
                DB::raw('a.name AS attacker_name'),
                DB::raw('alliances.name AS attacker_alliance'),
                DB::raw('t.name AS target_name'),
            ])
            ->join('players AS a', 'a.id', '=', 'hostile_spying.player_start_id')
            ->join('alliances', 'alliances.id', '=', 'a.alliance_id', 'left outer')
            ->join('players as t', 't.id', '=', 'hostile_spying.player_target_id')
            ->orderBy('created_at', 'DESC')
            ->paginate(50);

        $return->getCollection()->transform(function (HostileSpying $hostileSpying) {
            $hostileSpying->timestamp = $hostileSpying->created_at->shortAbsoluteDiffForHumans();

            return $hostileSpying;
        });

        return $return;
    }

    public function store(Request $request)
    {
        if (!$spying = HostileSpying::query()->where('external_id', $request->get('external_id'))->first()) {
            $spying = new HostileSpying();
            $spying->external_id = $request->get('external_id');
        }

        $spying->planet_start_coordinates = $request->get('planet_start_coordinates');
        $spying->player_start_id = Planet::query()->where('coordinates', $request->get('planet_start_coordinates') ?? null)->first()->player_id ?? null;
        $spying->planet_target_coordinates = $request->get('planet_target_coordinates');
        $spying->player_target_id = auth()->user()->player_id;
        $spying->created_at = Carbon::parse($request->get('date_time'));
        $spying->save();

        return response([]);
    }
}
