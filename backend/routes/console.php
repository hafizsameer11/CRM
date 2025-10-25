<?php

use App\Console\Commands\RefreshExpiringTokens;
use Illuminate\Support\Facades\Schedule;

Schedule::command(RefreshExpiringTokens::class)
    ->daily()
    ->at('02:00')
    ->timezone('UTC')
    ->description('Refresh expiring Meta API tokens');

// Clean up old webhook events (older than 30 days)
Schedule::call(function () {
    \App\Models\WebhookEvent::where('created_at', '<', now()->subDays(30))
        ->where('status', 'processed')
        ->delete();
})->daily()->at('03:00');

// Clean up old activity logs (older than 90 days)
Schedule::call(function () {
    \App\Models\ActivityLog::where('created_at', '<', now()->subDays(90))->delete();
})->weekly()->sundays()->at('04:00');
