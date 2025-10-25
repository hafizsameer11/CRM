<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
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
        $guard = auth('api');
        
        if (!$token = $guard->attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        /** @var \App\Models\User $user */
        $user = $guard->user();
        $user->update(['last_login_at' => now()]);

        ActivityLog::log($user, 'login');

        return $this->respondWithToken($token, $user);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(auth('api')->user()->load('tenant'));
    }

    public function refresh(): JsonResponse
    {
        /** @var \PHPOpenSourceSaver\JWTAuth\JWTGuard $guard */
        $guard = auth('api');
        return $this->respondWithToken($guard->refresh());
    }

    public function logout(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth('api')->user();
        ActivityLog::log($user, 'logout');

        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    protected function respondWithToken(string $token, $user = null): JsonResponse
    {
        /** @var \PHPOpenSourceSaver\JWTAuth\JWTGuard $guard */
        $guard = auth('api');
        
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $guard->factory()->getTTL() * 60,
            'user' => $user ?? $guard->user(),
        ]);
    }
}

