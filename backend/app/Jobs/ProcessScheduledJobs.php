<?php

namespace App\Jobs;

use App\Models\ScheduledJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessScheduledJobs implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $jobs = ScheduledJob::ready()->get();

        Log::info('Processing scheduled jobs', ['count' => $jobs->count()]);

        foreach ($jobs as $job) {
            $this->processJob($job);
        }
    }

    protected function processJob(ScheduledJob $scheduledJob): void
    {
        try {
            $scheduledJob->markAsRunning();

            match($scheduledJob->job_type) {
                'publish_post' => $this->publishPost($scheduledJob),
                'fetch_insights' => $this->fetchInsights($scheduledJob),
                default => throw new \Exception('Unknown job type: ' . $scheduledJob->job_type),
            };

            $scheduledJob->markAsCompleted();

        } catch (\Exception $e) {
            $scheduledJob->markAsFailed($e->getMessage());
            
            Log::error('Scheduled job failed', [
                'job_id' => $scheduledJob->id,
                'job_type' => $scheduledJob->job_type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function publishPost(ScheduledJob $scheduledJob): void
    {
        $postId = $scheduledJob->payload['post_id'] ?? null;

        if (!$postId) {
            throw new \Exception('No post_id in scheduled job payload');
        }

        $post = \App\Models\Post::find($postId);

        if (!$post) {
            throw new \Exception('Post not found: ' . $postId);
        }

        PublishScheduledPost::dispatch($post);
    }

    protected function fetchInsights(ScheduledJob $scheduledJob): void
    {
        $channelId = $scheduledJob->payload['channel_id'] ?? null;

        if (!$channelId) {
            throw new \Exception('No channel_id in scheduled job payload');
        }

        $channel = \App\Models\Channel::find($channelId);

        if (!$channel) {
            throw new \Exception('Channel not found: ' . $channelId);
        }

        FetchChannelInsights::dispatch($channel);
    }
}


