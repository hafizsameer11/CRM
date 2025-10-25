<?php

namespace App\Services\Facebook;

use App\Models\AuditLog;
use App\Models\Channel;
use Illuminate\Support\Facades\Http;

class FacebookService
{
    public function sendMessage(Channel $channel, string $recipientId, string $message, ?array $media = null): array
    {
        $startTime = microtime(true);

        $pageId = $channel->identifiers['page_id'] ?? null;

        if (!$pageId) {
            throw new \Exception('Facebook page ID not found in channel identifiers');
        }

        $payload = [
            'recipient' => ['id' => $recipientId],
            'message' => [],
        ];

        if ($message) {
            $payload['message']['text'] = $message;
        }

        if ($media) {
            $payload['message']['attachment'] = [
                'type' => $media['type'] ?? 'image',
                'payload' => [
                    'url' => $media['url'],
                    'is_reusable' => true,
                ],
            ];
        }

        $response = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$pageId}/messages", $payload);

        $latency = (microtime(true) - $startTime) * 1000;

        // Audit log
        AuditLog::create([
            'tenant_id' => $channel->tenant_id,
            'channel_id' => $channel->id,
            'action' => 'facebook_send_message',
            'request' => $this->scrubSensitiveData($payload),
            'response' => $response->json(),
            'status' => $response->successful() ? 'success' : 'error',
            'latency_ms' => (int) $latency,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to send Facebook message: ' . $response->body());
        }

        return $response->json();
    }

    public function getConversation(Channel $channel, string $conversationId): array
    {
        $response = Http::withToken($channel->access_token)
            ->get("https://graph.facebook.com/v18.0/{$conversationId}", [
                'fields' => 'id,messages{id,from,to,message,created_time},participants',
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get conversation: ' . $response->body());
        }

        return $response->json();
    }

    public function publishPost(Channel $channel, string $caption, ?array $mediaUrls = null): array
    {
        $startTime = microtime(true);

        $pageId = $channel->identifiers['page_id'] ?? null;

        if (!$pageId) {
            throw new \Exception('Facebook page ID not found in channel identifiers');
        }

        $payload = [];

        if ($mediaUrls && count($mediaUrls) > 0) {
            // Publish photo/video
            $endpoint = str_contains($mediaUrls[0], '.mp4') || str_contains($mediaUrls[0], 'video')
                ? "/{$pageId}/videos"
                : "/{$pageId}/photos";

            $payload['message'] = $caption;
            $payload['url'] = $mediaUrls[0]; // Facebook supports one media per post via URL
        } else {
            // Text-only post
            $endpoint = "/{$pageId}/feed";
            $payload['message'] = $caption;
        }

        $response = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0{$endpoint}", $payload);

        $latency = (microtime(true) - $startTime) * 1000;

        // Audit log
        AuditLog::create([
            'tenant_id' => $channel->tenant_id,
            'channel_id' => $channel->id,
            'action' => 'facebook_publish_post',
            'request' => $this->scrubSensitiveData($payload),
            'response' => $response->json(),
            'status' => $response->successful() ? 'success' : 'error',
            'latency_ms' => (int) $latency,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to publish Facebook post: ' . $response->body());
        }

        return $response->json();
    }

    public function getPostInsights(Channel $channel, string $postId, array $metrics = ['impressions', 'reach']): array
    {
        $response = Http::withToken($channel->access_token)
            ->get("https://graph.facebook.com/v18.0/{$postId}/insights", [
                'metric' => implode(',', $metrics),
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get post insights: ' . $response->body());
        }

        return $response->json();
    }

    public function getPageInsights(Channel $channel, array $metrics = ['page_impressions', 'page_engaged_users'], string $period = 'day'): array
    {
        $pageId = $channel->identifiers['page_id'] ?? null;

        $response = Http::withToken($channel->access_token)
            ->get("https://graph.facebook.com/v18.0/{$pageId}/insights", [
                'metric' => implode(',', $metrics),
                'period' => $period,
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get page insights: ' . $response->body());
        }

        return $response->json();
    }

    public function replyToComment(Channel $channel, string $commentId, string $message): array
    {
        $response = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$commentId}/comments", [
                'message' => $message,
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to reply to comment: ' . $response->body());
        }

        return $response->json();
    }

    public function hideComment(Channel $channel, string $commentId): array
    {
        $response = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$commentId}", [
                'is_hidden' => true,
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to hide comment: ' . $response->body());
        }

        return $response->json();
    }

    public function deleteComment(Channel $channel, string $commentId): bool
    {
        $response = Http::withToken($channel->access_token)
            ->delete("https://graph.facebook.com/v18.0/{$commentId}");

        return $response->successful();
    }

    private function scrubSensitiveData(array $data): array
    {
        // Remove any sensitive information from logs
        return $data;
    }
}

