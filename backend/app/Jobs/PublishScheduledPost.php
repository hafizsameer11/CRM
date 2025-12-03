<?php

namespace App\Jobs;

use App\Models\Post;
use App\Models\Channel;
use App\Models\ActivityLog;
use App\Services\Facebook\FacebookService;
use App\Services\Instagram\InstagramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PublishScheduledPost implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900]; // 1 min, 5 min, 15 min

    public function __construct(
        public Post $post
    ) {}

    public function handle(): void
    {
        try {
            $channel = $this->post->channel;

            if (!$channel || $channel->status !== 'active') {
                throw new \Exception('Channel not active or not found');
            }

            // Get media URLs
            $mediaUrls = $this->prepareMediaUrls();

            // Publish based on channel type
            $response = match($channel->type) {
                'facebook' => app(FacebookService::class)->publishPost(
                    $channel,
                    $this->post->caption ?? '',
                    $mediaUrls
                ),
                'instagram' => app(InstagramService::class)->publishPost(
                    $channel,
                    $this->post->caption ?? '',
                    $mediaUrls
                ),
                default => throw new \Exception('Unsupported channel type: ' . $channel->type),
            };

            // Update post with provider ID
            $this->post->update([
                'status' => 'published',
                'published_at' => now(),
                'provider_post_id' => $response['id'] ?? $response['post_id'] ?? null,
                'error' => null,
            ]);

            // Log activity
            ActivityLog::log(
                $this->post->creator,
                'post_published',
                'Post',
                $this->post->id,
                [
                    'channel' => $channel->type,
                    'provider_post_id' => $this->post->provider_post_id,
                ]
            );

            Log::info('Post published successfully', [
                'post_id' => $this->post->id,
                'channel_id' => $channel->id,
                'provider_post_id' => $this->post->provider_post_id,
            ]);

        } catch (\Exception $e) {
            $this->post->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            Log::error('Failed to publish post', [
                'post_id' => $this->post->id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            throw $e;
        }
    }

    protected function prepareMediaUrls(): ?array
    {
        if (!$this->post->media || count($this->post->media) === 0) {
            return null;
        }

        $urls = [];

        foreach ($this->post->media as $mediaId) {
            $mediaAsset = \App\Models\MediaAsset::find($mediaId);
            
            if ($mediaAsset) {
                // Use the model's url attribute which handles URL generation
                $relativeUrl = Storage::disk('public')->url($mediaAsset->storage_path);
                
                // Convert to absolute URL if it's relative
                if (str_starts_with($relativeUrl, 'http')) {
                    $urls[] = $relativeUrl;
                } else {
                    // Generate full absolute URL
                    $urls[] = url($relativeUrl);
                }
            }
        }

        return count($urls) > 0 ? $urls : null;
    }

    public function failed(\Throwable $exception): void
    {
        $this->post->update([
            'status' => 'failed',
            'error' => $exception->getMessage(),
        ]);

        Log::error('Post publishing job failed permanently', [
            'post_id' => $this->post->id,
            'error' => $exception->getMessage(),
        ]);
    }
}



