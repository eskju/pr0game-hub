<?php

namespace App\Http\Controllers;

use App\Models\TrackingXhrRequest;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TrackingXhrRequestController extends Controller
{
    public function store(Request $request)
    {
        $item = new TrackingXhrRequest();
        $item->player_name = $request->get('player_name');
        $item->target_url = $request->get('target_url');
        $item->payload = $request->get('payload');
        $item->ip_address = $request->ip();
        $item->save();
    }
}
