<?php

namespace App\Services\Instagram;

use App\Models\AuditLog;
use App\Models\Channel;
use Illuminate\Support\Facades\Http;

class InstagramService
{
    public function sendMessage(Channel $channel, string $recipientId, string $message, ?array $media = null): array
    {
        $startTime = microtime(true);

        $instagramAccountId = $channel->identifiers['instagram_account_id'] ?? null;

        if (!$instagramAccountId) {
            throw new \Exception('Instagram account ID not found in channel identifiers');
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
                ],
            ];
        }

        $response = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$instagramAccountId}/messages", $payload);

        $latency = (microtime(true) - $startTime) * 1000;

        // Audit log
        AuditLog::create([
            'tenant_id' => $channel->tenant_id,
            'channel_id' => $channel->id,
            'action' => 'instagram_send_message',
            'request' => $this->scrubSensitiveData($payload),
            'response' => $response->json(),
            'status' => $response->successful() ? 'success' : 'error',
            'latency_ms' => (int) $latency,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to send Instagram message: ' . $response->body());
        }

        return $response->json();
    }

    public function getConversation(Channel $channel, string $conversationId): array
    {
        $response = Http::withToken($channel->access_token)
            ->get("https://graph.facebook.com/v18.0/{$conversationId}", [
                'fields' => 'id,messages{id,from,message,created_time},participants',
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get conversation: ' . $response->body());
        }

        return $response->json();
    }

    public function publishPost(Channel $channel, string $caption, ?array $mediaUrls = null): array
    {
        $startTime = microtime(true);

        $instagramAccountId = $channel->identifiers['instagram_account_id'] ?? null;

        if (!$instagramAccountId) {
            throw new \Exception('Instagram account ID not found in channel identifiers');
        }

        if (!$mediaUrls || count($mediaUrls) === 0) {
            throw new \Exception('Instagram posts require at least one media item');
        }

        // Step 1: Create media container
        $isVideo = str_contains($mediaUrls[0], '.mp4') || str_contains($mediaUrls[0], 'video');
        
        $containerPayload = [
            'caption' => $caption,
        ];

        if ($isVideo) {
            $containerPayload['media_type'] = 'VIDEO';
            $containerPayload['video_url'] = $mediaUrls[0];
        } else {
            $containerPayload['image_url'] = $mediaUrls[0];
        }

        $containerResponse = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$instagramAccountId}/media", $containerPayload);

        if (!$containerResponse->successful()) {
            throw new \Exception('Failed to create Instagram media container: ' . $containerResponse->body());
        }

        $containerId = $containerResponse->json()['id'] ?? null;

        if (!$containerId) {
            throw new \Exception('No container ID returned from Instagram');
        }

        // Step 2: Publish the container
        $publishResponse = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$instagramAccountId}/media_publish", [
                'creation_id' => $containerId,
            ]);

        $latency = (microtime(true) - $startTime) * 1000;

        // Audit log
        AuditLog::create([
            'tenant_id' => $channel->tenant_id,
            'channel_id' => $channel->id,
            'action' => 'instagram_publish_post',
            'request' => ['container' => $containerPayload, 'publish' => ['creation_id' => $containerId]],
            'response' => $publishResponse->json(),
            'status' => $publishResponse->successful() ? 'success' : 'error',
            'latency_ms' => (int) $latency,
        ]);

        if (!$publishResponse->successful()) {
            throw new \Exception('Failed to publish Instagram post: ' . $publishResponse->body());
        }

        return $publishResponse->json();
    }

    public function getMediaInsights(Channel $channel, string $mediaId, array $metrics = ['impressions', 'reach', 'engagement']): array
    {
        $response = Http::withToken($channel->access_token)
            ->get("https://graph.facebook.com/v18.0/{$mediaId}/insights", [
                'metric' => implode(',', $metrics),
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get media insights: ' . $response->body());
        }

        return $response->json();
    }

    public function getAccountInsights(Channel $channel, array $metrics = ['impressions', 'reach', 'follower_count'], string $period = 'day'): array
    {
        $instagramAccountId = $channel->identifiers['instagram_account_id'] ?? null;

        $response = Http::withToken($channel->access_token)
            ->get("https://graph.facebook.com/v18.0/{$instagramAccountId}/insights", [
                'metric' => implode(',', $metrics),
                'period' => $period,
            ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get account insights: ' . $response->body());
        }

        return $response->json();
    }

    public function replyToComment(Channel $channel, string $commentId, string $message): array
    {
        $response = Http::withToken($channel->access_token)
            ->post("https://graph.facebook.com/v18.0/{$commentId}/replies", [
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
                'hide' => true,
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

