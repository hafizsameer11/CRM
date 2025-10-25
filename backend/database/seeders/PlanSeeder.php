<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'stripe_price_id' => env('STRIPE_STARTER_PRICE_ID', 'price_starter'),
                'monthly_price' => 2900, // $29.00
                'limits' => [
                    'max_channels' => 3,
                    'max_users' => 5,
                    'max_messages_per_month' => 1000,
                    'max_conversations' => 100,
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Growth',
                'slug' => 'growth',
                'stripe_price_id' => env('STRIPE_GROWTH_PRICE_ID', 'price_growth'),
                'monthly_price' => 9900, // $99.00
                'limits' => [
                    'max_channels' => 10,
                    'max_users' => 20,
                    'max_messages_per_month' => 5000,
                    'max_conversations' => 500,
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'stripe_price_id' => env('STRIPE_PRO_PRICE_ID', 'price_pro'),
                'monthly_price' => 19900, // $199.00
                'limits' => [
                    'max_channels' => -1, // unlimited
                    'max_users' => -1, // unlimited
                    'max_messages_per_month' => -1, // unlimited
                    'max_conversations' => -1, // unlimited
                ],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }

        $this->command->info('Plans seeded successfully!');
    }
}

