<?php

namespace App\Services;

use App\Models\Message;

class MessageService
{
    public static function storeMessageId($messageId)
    {
        $message = Message::query()
            ->where('user_id', auth()->id())
            ->where('external_id', $messageId)
            ->first();

        if (!$message) {
            $message = new Message();
            $message->user_id = auth()->id();
            $message->external_id = $messageId;
            $message->save();
        }
    }
}
