<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('email', 'password');

        /** @var \PHPOpenSourceSaver\JWTAuth\JWTGuard $guard */
        $guard = auth('admin');
        
        if (!$token = $guard->attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        /** @var \App\Models\Admin $admin */
        $admin = $guard->user();
        $admin->update(['last_login_at' => now()]);

        ActivityLog::log($admin, 'admin_login');

        return $this->respondWithToken($token, $admin);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(auth('admin')->user());
    }

    public function refresh(): JsonResponse
    {
        /** @var \PHPOpenSourceSaver\JWTAuth\JWTGuard $guard */
        $guard = auth('admin');
        return $this->respondWithToken($guard->refresh());
    }

    public function logout(): JsonResponse
    {
        /** @var \App\Models\Admin $admin */
        $admin = auth('admin')->user();
        ActivityLog::log($admin, 'admin_logout');

        auth('admin')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    protected function respondWithToken(string $token, $admin = null): JsonResponse
    {
        /** @var \PHPOpenSourceSaver\JWTAuth\JWTGuard $guard */
        $guard = auth('admin');
        
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $guard->factory()->getTTL() * 60,
            'admin' => $admin ?? $guard->user(),
        ]);
    }
}

