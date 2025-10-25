<?php

namespace App\Http\Controllers\Api\Meta;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Channel;
use App\Services\Meta\MetaOAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConnectController extends Controller
{
    private MetaOAuthService $metaService;

    public function __construct(MetaOAuthService $metaService)
    {
        $this->metaService = $metaService;
    }

    public function redirectToProvider(Request $request): RedirectResponse
    {
        // Get tenant ID from authenticated user or query token
        $tenantId = $request->_tenant_id;
        
        // If token in query, validate it manually (for OAuth redirect flow)
        if ($request->has('token') && !$tenantId) {
            try {
                /** @var \PHPOpenSourceSaver\JWTAuth\JWTGuard $guard */
                $guard = auth('api');
                $user = $guard->setToken($request->token)->user();
                if ($user) {
                    $tenantId = $user->tenant_id;
                }
            } catch (\Exception $e) {
                return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=unauthorized');
            }
        }
        
        if (!$tenantId) {
            return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=unauthorized');
        }

        session(['meta_oauth_tenant_id' => $tenantId]);

        $authUrl = $this->metaService->getAuthorizationUrl();

        return redirect($authUrl);
    }

    public function handleCallback(Request $request): JsonResponse|RedirectResponse
    {
        if ($request->has('error')) {
            return response()->json([
                'error' => 'OAuth authorization failed',
                'message' => $request->error_description,
            ], 400);
        }

        if (!$request->has('code')) {
            return response()->json(['error' => 'Authorization code not provided'], 400);
        }

        try {
            $tenantId = session('meta_oauth_tenant_id');

            // Exchange code for short-lived token
            $tokenData = $this->metaService->exchangeCodeForToken($request->code);

            // Get long-lived token
            $longLivedToken = $this->metaService->getLongLivedToken($tokenData['access_token']);

            // Store in session for later use
            session([
                'meta_access_token' => $longLivedToken['access_token'],
                'meta_token_expires_in' => $longLivedToken['expires_in'] ?? 5184000, // 60 days default
            ]);

            // Redirect to frontend with success
            $frontendUrl = config('app.frontend_url') . '/settings/channels?oauth=success';
            return redirect($frontendUrl);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to complete OAuth flow',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function attachFacebookPage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|string',
            'page_name' => 'required|string',
            'page_access_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;

        try {
            $channel = Channel::create([
                'tenant_id' => $tenantId,
                'type' => 'facebook',
                'identifiers' => [
                    'page_id' => $request->page_id,
                    'page_name' => $request->page_name,
                ],
                'access_token' => $request->page_access_token,
                'expires_at' => now()->addDays(60),
                'status' => 'active',
            ]);

            $actor = auth('api')->user();
            ActivityLog::log($actor, 'attach_facebook_page', 'Channel', $channel->id);

            return response()->json($channel, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to attach Facebook page',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function attachInstagramAccount(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'instagram_account_id' => 'required|string',
            'username' => 'required|string',
            'access_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;

        try {
            $channel = Channel::create([
                'tenant_id' => $tenantId,
                'type' => 'instagram',
                'identifiers' => [
                    'instagram_account_id' => $request->instagram_account_id,
                    'username' => $request->username,
                ],
                'access_token' => $request->access_token,
                'expires_at' => now()->addDays(60),
                'status' => 'active',
            ]);

            $actor = auth('api')->user();
            ActivityLog::log($actor, 'attach_instagram_account', 'Channel', $channel->id);

            return response()->json($channel, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to attach Instagram account',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function attachWhatsAppNumber(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone_number_id' => 'required|string',
            'phone_number' => 'required|string',
            'access_token' => 'required|string',
            'waba_id' => 'required|string', // WhatsApp Business Account ID
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;

        try {
            $channel = Channel::create([
                'tenant_id' => $tenantId,
                'type' => 'whatsapp',
                'identifiers' => [
                    'phone_number_id' => $request->phone_number_id,
                    'phone_number' => $request->phone_number,
                    'waba_id' => $request->waba_id,
                ],
                'access_token' => $request->access_token,
                'expires_at' => now()->addDays(60),
                'status' => 'active',
            ]);

            $actor = auth('api')->user();
            ActivityLog::log($actor, 'attach_whatsapp_number', 'Channel', $channel->id);

            return response()->json($channel, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to attach WhatsApp number',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPages(Request $request): JsonResponse
    {
        $accessToken = session('meta_access_token') ?? $request->access_token;

        if (!$accessToken) {
            return response()->json(['error' => 'Access token not found'], 401);
        }

        try {
            $pages = $this->metaService->getUserPages($accessToken);

            return response()->json(['pages' => $pages]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch pages',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

