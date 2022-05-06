<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function index(Request $request): array
    {
        $messageIds = [];

        foreach ($request->get('messageIds') ?? [] as $messageId) {
            if (!Message::query()->where('user_id', auth()->id())->where('external_id', $messageId)->exists()) {
                $messageIds[] = $messageId;
            }
        }

        return $messageIds;
    }
}
