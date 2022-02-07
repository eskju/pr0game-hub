<?php

namespace App\Http\Controllers;

use App\Models\Expedition;
use App\Models\HostileSpying;
use App\Models\Planet;
use Carbon\Carbon;
use Illuminate\Http\Request;

class HostileSpyingController extends Controller
{
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
