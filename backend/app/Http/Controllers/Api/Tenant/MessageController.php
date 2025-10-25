<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Jobs\SendOutboundMessage;
use App\Models\ActivityLog;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\UsageRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index(int $conversationId, Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($conversationId);

        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at', $request->get('sort_order', 'desc'))
            ->paginate($request->get('per_page', 50));

        return response()->json($messages);
    }

    public function store(int $conversationId, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'body' => 'required_without:media|string',
            'media' => 'required_without:body|array',
            'media.*.url' => 'required|url',
            'media.*.type' => 'required|in:image,video,audio,file',
            'type' => 'sometimes|in:text,image,video,audio,file',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($conversationId);

        // Create message (placeholder - will be sent via job)
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'provider_message_id' => 'pending_' . uniqid(),
            'direction' => 'out',
            'body' => $request->body,
            'media' => $request->media,
            'type' => $request->get('type', 'text'),
        ]);

        // Update conversation last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Track usage
        UsageRecord::incrementUsage($tenantId, 'messages');

        $actor = auth('api')->user();
        ActivityLog::log($actor, 'send_message', 'Message', $message->id);

        // Dispatch job to actually send the message
        SendOutboundMessage::dispatch($message);

        return response()->json($message, 201);
    }

    public function show(int $conversationId, int $id, Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($conversationId);

        $message = Message::where('conversation_id', $conversation->id)->findOrFail($id);

        return response()->json($message);
    }
}

