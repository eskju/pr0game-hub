<?php

namespace App\Http\Controllers;

use App\Models\Expedition;
use App\Services\ExpeditionService;
use App\Services\ImprovedCarbon;
use App\Services\MessageService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExpeditionController extends Controller
{
    public function store(Request $request)
    {
        MessageService::storeMessageId($request->get('id'));

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

        ExpeditionService::parseMessage($expedition);

        return response([]);
    }
}
