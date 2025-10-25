<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Cashier\Cashier;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $request->header('Stripe-Signature');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $request->getContent(),
                $signature,
                config('cashier.webhook.secret')
            );
        } catch (\Exception $e) {
            Log::error('Invalid Stripe webhook signature', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        try {
            match ($event->type) {
                'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->data->object),
                'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object),
                'invoice.payment_succeeded' => $this->handleInvoicePaymentSucceeded($event->data->object),
                'invoice.payment_failed' => $this->handleInvoicePaymentFailed($event->data->object),
                default => null,
            };

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Failed to process Stripe webhook', [
                'event_type' => $event->type,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Processing failed'], 500);
        }
    }

    private function handleSubscriptionUpdated($subscription): void
    {
        $localSubscription = Subscription::where('stripe_subscription_id', $subscription->id)->first();

        if (!$localSubscription) {
            return;
        }

        $localSubscription->update([
            'status' => $subscription->status,
            'current_period_start' => now()->timestamp($subscription->current_period_start),
            'current_period_end' => now()->timestamp($subscription->current_period_end),
        ]);

        // Update tenant status based on subscription status
        $tenant = $localSubscription->tenant;

        if (in_array($subscription->status, ['past_due', 'unpaid'])) {
            $tenant->update(['status' => 'restricted']);
        } elseif ($subscription->status === 'active') {
            $tenant->update(['status' => 'active']);
        }
    }

    private function handleSubscriptionDeleted($subscription): void
    {
        $localSubscription = Subscription::where('stripe_subscription_id', $subscription->id)->first();

        if (!$localSubscription) {
            return;
        }

        $localSubscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
        ]);

        // Suspend tenant
        $tenant = $localSubscription->tenant;
        $tenant->update(['status' => 'suspended']);
    }

    private function handleInvoicePaymentSucceeded($invoice): void
    {
        $subscriptionId = $invoice->subscription;

        if (!$subscriptionId) {
            return;
        }

        $localSubscription = Subscription::where('stripe_subscription_id', $subscriptionId)->first();

        if (!$localSubscription) {
            return;
        }

        // Ensure tenant is active
        $tenant = $localSubscription->tenant;
        if ($tenant->status !== 'active') {
            $tenant->update(['status' => 'active']);
        }

        Log::info('Invoice payment succeeded', [
            'tenant_id' => $tenant->id,
            'invoice_id' => $invoice->id,
        ]);
    }

    private function handleInvoicePaymentFailed($invoice): void
    {
        $subscriptionId = $invoice->subscription;

        if (!$subscriptionId) {
            return;
        }

        $localSubscription = Subscription::where('stripe_subscription_id', $subscriptionId)->first();

        if (!$localSubscription) {
            return;
        }

        // Restrict tenant access
        $tenant = $localSubscription->tenant;
        $tenant->update(['status' => 'restricted']);

        Log::warning('Invoice payment failed', [
            'tenant_id' => $tenant->id,
            'invoice_id' => $invoice->id,
        ]);
    }
}

