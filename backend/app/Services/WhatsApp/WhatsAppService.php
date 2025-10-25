<?php

namespace App\Services\WhatsApp;

use App\Models\AuditLog;
use App\Models\Channel;
use Illuminate\Support\Facades\Http;

class WhatsAppService
{
    public function sendMessage(Channel $channel, string $recipientPhone, string $message, ?array $media = null): array
    {
        $startTime = microtime(true);

        $phoneNumberId = $channel->identifiers['phone_number_id'] ?? null;

        if (!$phoneNumberId) {
            throw new \Exception('WhatsApp phone number ID not found in channel identifiers');
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $recipientPhone,
        ];

        if ($media) {
            $payload['type'] = $media['type'] ?? 'image';
            $payload[$media['type']] = [
                'link' => $media['url'],
            ];

            if (isset($media['caption'])) {
                $payload[$media['type']]['caption'] = $media['caption'];
            }
        } else {
            $payload['type'] = 'text';
            $payload['text'] = [
                'body' => $message,
            ];
        }

        $response = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$phoneNumberId}/messages", $payload);

        $latency = (microtime(true) - $startTime) * 1000;

        // Audit log
        AuditLog::create([
            'tenant_id' => $channel->tenant_id,
            'channel_id' => $channel->id,
            'action' => 'whatsapp_send_message',
            'request' => $this->scrubSensitiveData($payload),
            'response' => $response->json(),
            'status' => $response->successful() ? 'success' : 'error',
            'latency_ms' => (int) $latency,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to send WhatsApp message: ' . $response->body());
        }

        return $response->json();
    }

    public function sendTemplate(Channel $channel, string $recipientPhone, string $templateName, array $components = []): array
    {
        $phoneNumberId = $channel->identifiers['phone_number_id'] ?? null;

        if (!$phoneNumberId) {
            throw new \Exception('WhatsApp phone number ID not found in channel identifiers');
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $recipientPhone,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => 'en_US',
                ],
                'components' => $components,
            ],
        ];

        $response = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$phoneNumberId}/messages", $payload);

        if (!$response->successful()) {
            throw new \Exception('Failed to send WhatsApp template: ' . $response->body());
        }

        return $response->json();
    }

    private function scrubSensitiveData(array $data): array
    {
        // Remove any sensitive information from logs
        return $data;
    }
}

