<?php

namespace App\Jobs;

use App\Models\Channel;
use App\Models\Insight;
use App\Services\Facebook\FacebookService;
use App\Services\Instagram\InstagramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FetchChannelInsights implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;

    public function __construct(
        public Channel $channel,
        public ?Carbon $date = null
    ) {
        $this->date = $date ?? now()->subDay();
    }

    public function handle(): void
    {
        try {
            if ($this->channel->status !== 'active') {
                Log::info('Skipping insights for inactive channel', ['channel_id' => $this->channel->id]);
                return;
            }

            $insights = match($this->channel->type) {
                'facebook' => $this->fetchFacebookInsights(),
                'instagram' => $this->fetchInstagramInsights(),
                default => [],
            };

            $this->storeInsights($insights);

            Log::info('Channel insights fetched successfully', [
                'channel_id' => $this->channel->id,
                'date' => $this->date->toDateString(),
                'metrics_count' => count($insights),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch channel insights', [
                'channel_id' => $this->channel->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function fetchFacebookInsights(): array
    {
        $service = app(FacebookService::class);
        
        $metrics = [
            'page_impressions',
            'page_engaged_users',
            'page_post_engagements',
            'page_fans', // followers
        ];

        $response = $service->getPageInsights($this->channel, $metrics, 'day');

        $insights = [];

        foreach ($response['data'] ?? [] as $metric) {
            $name = $metric['name'] ?? null;
            $values = $metric['values'] ?? [];

            if ($name && count($values) > 0) {
                $value = $values[0]['value'] ?? 0;
                
                $insights[$this->normalizeMetricName($name)] = $value;
            }
        }

        return $insights;
    }

    protected function fetchInstagramInsights(): array
    {
        $service = app(InstagramService::class);
        
        $metrics = [
            'impressions',
            'reach',
            'follower_count',
            'profile_views',
        ];

        $response = $service->getAccountInsights($this->channel, $metrics, 'day');

        $insights = [];

        foreach ($response['data'] ?? [] as $metric) {
            $name = $metric['name'] ?? null;
            $values = $metric['values'] ?? [];

            if ($name && count($values) > 0) {
                $value = $values[0]['value'] ?? 0;
                
                $insights[$this->normalizeMetricName($name)] = $value;
            }
        }

        return $insights;
    }

    protected function storeInsights(array $insights): void
    {
        foreach ($insights as $metric => $value) {
            Insight::updateOrCreate(
                [
                    'tenant_id' => $this->channel->tenant_id,
                    'channel_id' => $this->channel->id,
                    'metric' => $metric,
                    'date' => $this->date->toDateString(),
                    'period' => 'day',
                ],
                [
                    'value' => $value,
                ]
            );
        }
    }

    protected function normalizeMetricName(string $name): string
    {
        // Normalize metric names across platforms
        $map = [
            'page_impressions' => 'impressions',
            'page_engaged_users' => 'engaged_users',
            'page_post_engagements' => 'engagements',
            'page_fans' => 'followers',
            'follower_count' => 'followers',
            'profile_views' => 'profile_views',
        ];

        return $map[$name] ?? $name;
    }
}



