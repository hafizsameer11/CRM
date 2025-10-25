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

class ProcessWhatsAppWebhook implements ShouldQueue
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
            Log::error('Failed to process WhatsApp webhook', [
                'webhook_id' => $this->webhookEvent->id,
                'error' => $e->getMessage(),
            ]);

            $this->webhookEvent->markAsFailed($e->getMessage());
        }
    }

    private function processEntry(array $entry): void
    {
        $changes = $entry['changes'] ?? [];

        foreach ($changes as $change) {
            if ($change['field'] === 'messages') {
                $this->processMessages($change['value']);
            }
        }
    }

    private function processMessages(array $value): void
    {
        $phoneNumberId = $value['metadata']['phone_number_id'] ?? null;

        if (!$phoneNumberId) {
            return;
        }

        // Find the channel for this phone number
        $channel = Channel::where('type', 'whatsapp')
            ->whereJsonContains('identifiers->phone_number_id', $phoneNumberId)
            ->first();

        if (!$channel) {
            Log::warning('Channel not found for WhatsApp phone number', ['phone_number_id' => $phoneNumberId]);
            return;
        }

        $this->webhookEvent->update([
            'tenant_id' => $channel->tenant_id,
            'channel_id' => $channel->id,
        ]);

        // Process messages
        if (isset($value['messages'])) {
            foreach ($value['messages'] as $message) {
                $this->processMessage($channel, $message);
            }
        }

        // Process statuses (delivery, read receipts)
        if (isset($value['statuses'])) {
            foreach ($value['statuses'] as $status) {
                $this->processStatus($channel, $status);
            }
        }
    }

    private function processMessage(Channel $channel, array $messageData): void
    {
        $messageId = $messageData['id'];
        $from = $messageData['from'];

        // Check idempotency
        if (Message::where('provider_message_id', $messageId)->exists()) {
            return;
        }

        // Find or create conversation
        $conversation = Conversation::firstOrCreate(
            [
                'channel_id' => $channel->id,
                'peer_id' => $from,
            ],
            [
                'tenant_id' => $channel->tenant_id,
                'status' => 'open',
            ]
        );

        $type = $messageData['type'] ?? 'text';
        $body = null;
        $media = null;

        // Extract message content based on type
        switch ($type) {
            case 'text':
                $body = $messageData['text']['body'] ?? null;
                break;
            case 'image':
            case 'video':
            case 'audio':
            case 'document':
                $media = [$messageData[$type]];
                $body = $messageData[$type]['caption'] ?? null;
                break;
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'provider_message_id' => $messageId,
            'direction' => 'in',
            'body' => $body,
            'media' => $media,
            'type' => $type,
            'meta' => $messageData,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Track usage
        UsageRecord::incrementUsage($channel->tenant_id, 'messages');
    }

    private function processStatus(Channel $channel, array $status): void
    {
        $messageId = $status['id'];
        $statusType = $status['status']; // sent, delivered, read, failed

        $updates = match ($statusType) {
            'delivered' => ['delivered_at' => now()],
            'read' => ['read_at' => now(), 'delivered_at' => now()],
            default => [],
        };

        if (!empty($updates)) {
            Message::where('provider_message_id', $messageId)->update($updates);
        }
    }
}

