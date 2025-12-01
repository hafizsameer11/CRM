<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlanController extends Controller
{
    /**
     * List all plans
     */
    public function index(): JsonResponse
    {
        $plans = Plan::orderBy('monthly_price')->get();
        return response()->json($plans);
    }

    /**
     * Get a single plan
     */
    public function show(int $id): JsonResponse
    {
        $plan = Plan::findOrFail($id);
        return response()->json($plan);
    }

    /**
     * Create a new plan
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:plans,slug',
            'monthly_price' => 'required|numeric|min:0',
            'limits' => 'required|array',
            'limits.channels' => 'required|integer|min:1',
            'limits.users' => 'required|integer|min:1',
            'limits.messages_per_month' => 'required|integer|min:1',
            'limits.posting_limits' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        $plan = Plan::create($request->all());

        return response()->json($plan, 201);
    }

    /**
     * Update an existing plan
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $plan = Plan::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:plans,slug,' . $id,
            'monthly_price' => 'sometimes|numeric|min:0',
            'limits' => 'sometimes|array',
            'limits.channels' => 'sometimes|integer|min:1',
            'limits.users' => 'sometimes|integer|min:1',
            'limits.messages_per_month' => 'sometimes|integer|min:1',
            'limits.posting_limits' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        $plan->update($request->all());

        return response()->json($plan);
    }

    /**
     * Delete a plan
     */
    public function destroy(int $id): JsonResponse
    {
        $plan = Plan::findOrFail($id);

        // Check if any tenants are on this plan
        if ($plan->subscriptions()->exists()) {
            return response()->json([
                'error' => 'Cannot delete plan',
                'message' => 'This plan has active subscriptions',
            ], 422);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted successfully']);
    }
}



