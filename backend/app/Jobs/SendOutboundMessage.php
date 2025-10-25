<?php

namespace App\Jobs;

use App\Models\Message;
use App\Services\Facebook\FacebookService;
use App\Services\Instagram\InstagramService;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendOutboundMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Message $message
    ) {}

    public function handle(
        FacebookService $facebookService,
        InstagramService $instagramService,
        WhatsAppService $whatsappService
    ): void {
        try {
            $conversation = $this->message->conversation;
            $channel = $conversation->channel;

            $response = match ($channel->type) {
                'facebook' => $facebookService->sendMessage(
                    $channel,
                    $conversation->peer_id,
                    $this->message->body,
                    $this->message->media ? $this->message->media[0] : null
                ),
                'instagram' => $instagramService->sendMessage(
                    $channel,
                    $conversation->peer_id,
                    $this->message->body,
                    $this->message->media ? $this->message->media[0] : null
                ),
                'whatsapp' => $whatsappService->sendMessage(
                    $channel,
                    $conversation->peer_id,
                    $this->message->body,
                    $this->message->media ? $this->message->media[0] : null
                ),
                default => throw new \Exception("Unsupported channel type: {$channel->type}"),
            };

            // Update message with provider's message ID
            $this->message->update([
                'provider_message_id' => $response['message_id'] ?? $response['id'] ?? uniqid(),
                'meta' => array_merge($this->message->meta ?? [], ['response' => $response]),
            ]);

            Log::info('Outbound message sent successfully', [
                'message_id' => $this->message->id,
                'channel_type' => $channel->type,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send outbound message', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
            ]);

            // Update message status if needed
            $this->message->update([
                'meta' => array_merge($this->message->meta ?? [], [
                    'error' => $e->getMessage(),
                    'failed_at' => now()->toIso8601String(),
                ]),
            ]);

            throw $e;
        }
    }
}

