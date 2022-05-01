<?php

namespace App\Http\Controllers;

use App\Models\Expedition;
use App\Services\ImprovedCarbon;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExpeditionController extends Controller
{
    public function store(Request $request)
    {
        if (!$expedition = Expedition::query()->where('external_id', $request->get('external_id'))->first()) {
            $expedition = new Expedition();
            $expedition->external_id = $request->get('external_id');
        }

        $expedition->player_id = auth()->user()->player_id;
        $expedition->message = $request->get('message');
        $expedition->type = $request->get('type');
        $expedition->size = $request->get('size');
        $expedition->created_at = ImprovedCarbon::parse($request->get('date_time'));
        $expedition->save();

        return response([]);
    }
}
