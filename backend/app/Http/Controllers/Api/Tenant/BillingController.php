<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Laravel\Cashier\Cashier;

class BillingController extends Controller
{
    public function plans(): JsonResponse
    {
        $plans = Plan::where('is_active', true)->get();

        return response()->json($plans);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:plans,id',
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;
        $tenant = Tenant::findOrFail($tenantId);
        $plan = Plan::findOrFail($request->plan_id);

        try {
            // Create Stripe customer if not exists
            if (!$tenant->stripe_customer_id) {
                $stripeCustomer = Cashier::stripe()->customers->create([
                    'email' => $tenant->email,
                    'name' => $tenant->name,
                    'metadata' => [
                        'tenant_id' => $tenant->id,
                    ],
                ]);

                $tenant->update(['stripe_customer_id' => $stripeCustomer->id]);
            }

            // Attach payment method
            $paymentMethod = Cashier::stripe()->paymentMethods->retrieve($request->payment_method);
            $paymentMethod->attach(['customer' => $tenant->stripe_customer_id]);

            // Set as default payment method
            Cashier::stripe()->customers->update($tenant->stripe_customer_id, [
                'invoice_settings' => [
                    'default_payment_method' => $request->payment_method,
                ],
            ]);

            // Create subscription
            $stripeSubscription = Cashier::stripe()->subscriptions->create([
                'customer' => $tenant->stripe_customer_id,
                'items' => [
                    ['price' => $plan->stripe_price_id],
                ],
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $plan->id,
                ],
            ]);

            // Store subscription
            $subscription = Subscription::create([
                'tenant_id' => $tenant->id,
                'stripe_subscription_id' => $stripeSubscription->id,
                'plan_id' => $plan->id,
                'status' => $stripeSubscription->status,
                'current_period_start' => now()->timestamp($stripeSubscription->current_period_start),
                'current_period_end' => now()->timestamp($stripeSubscription->current_period_end),
            ]);

            $actor = auth('api')->user();
            ActivityLog::log($actor, 'subscribe', 'Subscription', $subscription->id, [
                'plan' => $plan->name,
            ]);

            return response()->json([
                'message' => 'Subscription created successfully',
                'subscription' => $subscription->load('plan'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create subscription',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function currentSubscription(Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $subscription = Subscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->with('plan')
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json(['error' => 'No active subscription'], 404);
        }

        return response()->json($subscription);
    }

    public function cancelSubscription(Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $subscription = Subscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json(['error' => 'No active subscription'], 404);
        }

        try {
            // Cancel at period end
            Cashier::stripe()->subscriptions->update($subscription->stripe_subscription_id, [
                'cancel_at_period_end' => true,
            ]);

            $subscription->update([
                'canceled_at' => now(),
            ]);

            $actor = auth('api')->user();
            ActivityLog::log($actor, 'cancel_subscription', 'Subscription', $subscription->id);

            return response()->json([
                'message' => 'Subscription will be canceled at period end',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to cancel subscription',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function resumeSubscription(Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $subscription = Subscription::where('tenant_id', $tenantId)
            ->whereNotNull('canceled_at')
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json(['error' => 'No canceled subscription found'], 404);
        }

        try {
            Cashier::stripe()->subscriptions->update($subscription->stripe_subscription_id, [
                'cancel_at_period_end' => false,
            ]);

            $subscription->update([
                'canceled_at' => null,
            ]);

            $actor = auth('api')->user();
            ActivityLog::log($actor, 'resume_subscription', 'Subscription', $subscription->id);

            return response()->json([
                'message' => 'Subscription resumed successfully',
                'subscription' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to resume subscription',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updatePaymentMethod(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;
        $tenant = Tenant::findOrFail($tenantId);

        if (!$tenant->stripe_customer_id) {
            return response()->json(['error' => 'No Stripe customer found'], 404);
        }

        try {
            $paymentMethod = Cashier::stripe()->paymentMethods->retrieve($request->payment_method);
            $paymentMethod->attach(['customer' => $tenant->stripe_customer_id]);

            Cashier::stripe()->customers->update($tenant->stripe_customer_id, [
                'invoice_settings' => [
                    'default_payment_method' => $request->payment_method,
                ],
            ]);

            $actor = auth('api')->user();
            ActivityLog::log($actor, 'update_payment_method', 'Tenant', $tenant->id);

            return response()->json(['message' => 'Payment method updated successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update payment method',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function invoices(Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;
        $tenant = Tenant::findOrFail($tenantId);

        if (!$tenant->stripe_customer_id) {
            return response()->json(['invoices' => []]);
        }

        try {
            $invoices = Cashier::stripe()->invoices->all([
                'customer' => $tenant->stripe_customer_id,
                'limit' => 20,
            ]);

            return response()->json(['invoices' => $invoices->data]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch invoices',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

