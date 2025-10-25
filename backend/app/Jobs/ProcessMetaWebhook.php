<?php

namespace App\Jobs;

use App\Models\Channel;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\UsageRecord;
use App\Models\WebhookEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMetaWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public WebhookEvent $webhookEvent
    ) {}

    public function handle(): void
    {
        try {
            $this->webhookEvent->markAsProcessing();

            $payload = $this->webhookEvent->payload;

            if (!isset($payload['entry'])) {
                throw new \Exception('Invalid webhook payload: missing entry field');
            }

            foreach ($payload['entry'] as $entry) {
                $this->processEntry($entry);
            }

            $this->webhookEvent->markAsProcessed();
        } catch (\Exception $e) {
            Log::error('Failed to process Meta webhook', [
                'webhook_id' => $this->webhookEvent->id,
                'error' => $e->getMessage(),
            ]);

            $this->webhookEvent->markAsFailed($e->getMessage());
        }
    }

    private function processEntry(array $entry): void
    {
        $messaging = $entry['messaging'] ?? [];

        foreach ($messaging as $event) {
            $this->processMessagingEvent($event);
        }

        // Handle Instagram comments/mentions
        if (isset($entry['changes'])) {
            foreach ($entry['changes'] as $change) {
                $this->processChange($change);
            }
        }
    }

    private function processMessagingEvent(array $event): void
    {
        $pageId = $event['recipient']['id'] ?? null;
        $senderId = $event['sender']['id'] ?? null;

        if (!$pageId || !$senderId) {
            return;
        }

        // Find the channel for this page
        $channel = Channel::where('type', 'facebook')
            ->whereJsonContains('identifiers->page_id', $pageId)
            ->first();

        if (!$channel) {
            Log::warning('Channel not found for Facebook page', ['page_id' => $pageId]);
            return;
        }

        $this->webhookEvent->update([
            'tenant_id' => $channel->tenant_id,
            'channel_id' => $channel->id,
        ]);

        // Find or create conversation
        $conversation = Conversation::firstOrCreate(
            [
                'channel_id' => $channel->id,
                'peer_id' => $senderId,
            ],
            [
                'tenant_id' => $channel->tenant_id,
                'status' => 'open',
            ]
        );

        // Process message if exists
        if (isset($event['message'])) {
            $this->processMessage($conversation, $event['message']);
        }

        // Process delivery confirmation
        if (isset($event['delivery'])) {
            $this->processDelivery($conversation, $event['delivery']);
        }

        // Process read receipt
        if (isset($event['read'])) {
            $this->processRead($conversation, $event['read']);
        }
    }

    private function processMessage(Conversation $conversation, array $messageData): void
    {
        $messageId = $messageData['mid'];

        // Check idempotency
        if (Message::where('provider_message_id', $messageId)->exists()) {
            return;
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'provider_message_id' => $messageId,
            'direction' => 'in',
            'body' => $messageData['text'] ?? null,
            'media' => $messageData['attachments'] ?? null,
            'type' => $this->determineMessageType($messageData),
            'meta' => $messageData,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Track usage
        UsageRecord::incrementUsage($conversation->tenant_id, 'messages');
    }

    private function processDelivery(Conversation $conversation, array $delivery): void
    {
        $messageIds = $delivery['mids'] ?? [];

        foreach ($messageIds as $mid) {
            Message::where('provider_message_id', $mid)
                ->where('conversation_id', $conversation->id)
                ->update(['delivered_at' => now()]);
        }
    }

    private function processRead(Conversation $conversation, array $read): void
    {
        Message::where('conversation_id', $conversation->id)
            ->where('direction', 'out')
            ->whereNull('read_at')
            ->where('created_at', '<=', now())
            ->update(['read_at' => now()]);
    }

    private function processChange(array $change): void
    {
        // Handle Instagram-specific changes (comments, mentions, etc.)
        $field = $change['field'] ?? null;
        $value = $change['value'] ?? null;

        if ($field === 'comments' && $value) {
            // Handle Instagram comments
            $this->processInstagramComment($value);
        }
    }

    private function processInstagramComment(array $commentData): void
    {
        // Implementation for Instagram comments
        // Similar to message processing
    }

    private function determineMessageType(array $messageData): string
    {
        if (isset($messageData['attachments']) && count($messageData['attachments']) > 0) {
            $attachment = $messageData['attachments'][0];
            return $attachment['type'] ?? 'file';
        }

        return 'text';
    }
}

