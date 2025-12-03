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
        try {
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
                    \Log::error('OAuth token validation failed', ['error' => $e->getMessage()]);
                    return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=unauthorized');
                }
            }
            
            if (!$tenantId) {
                \Log::error('OAuth redirect failed: No tenant ID');
                return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=unauthorized');
            }

            // Store OAuth type and tenant ID - use encrypted state parameter instead of session
            $type = $request->query('type', 'facebook'); // Default to facebook if not specified
            
            // Encode tenant_id and type in state parameter for OAuth
            $state = base64_encode(json_encode([
                'tenant_id' => $tenantId,
                'type' => $type,
                'timestamp' => time(),
            ]));

            $authUrl = $this->metaService->getAuthorizationUrl([], $state);
            
            \Log::info('OAuth redirect', ['tenant_id' => $tenantId, 'type' => $type, 'auth_url' => $authUrl]);

            return redirect($authUrl);
        } catch (\Exception $e) {
            \Log::error('OAuth redirect error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=server_error');
        }
    }

    public function handleCallback(Request $request): JsonResponse|RedirectResponse
    {
        if ($request->has('error')) {
            return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=' . urlencode($request->error));
        }

        if (!$request->has('code')) {
            return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=no_code');
        }

        try {
            // Decode state parameter to get tenant_id and type
            $state = $request->query('state');
            $stateData = null;
            $tenantId = null;
            $type = 'facebook';
            
            if ($state) {
                try {
                    $stateData = json_decode(base64_decode($state), true);
                    if ($stateData && isset($stateData['tenant_id'])) {
                        $tenantId = $stateData['tenant_id'];
                        $type = $stateData['type'] ?? 'facebook';
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to decode OAuth state', ['error' => $e->getMessage()]);
                }
            }
            
            // Fallback to session if state not available
            if (!$tenantId) {
                $tenantId = session('meta_oauth_tenant_id');
                $type = session('meta_oauth_type', 'facebook');
            }

            if (!$tenantId) {
                return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=unauthorized');
            }

            // Exchange code for short-lived token
            $tokenData = $this->metaService->exchangeCodeForToken($request->code);

            // Get long-lived token
            $longLivedToken = $this->metaService->getLongLivedToken($tokenData['access_token']);

            // Redirect to frontend integrations page with OAuth success
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000') . '/integrations?oauth=success&token=' . urlencode($longLivedToken['access_token']) . '&type=' . urlencode($type);
            return redirect($frontendUrl);
        } catch (\Exception $e) {
            \Log::error('OAuth callback error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect(config('app.frontend_url', 'http://localhost:3000') . '/integrations?error=server_error');
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
        // Accept token from query param, request body, or session
        $accessToken = $request->query('access_token') 
            ?? $request->input('access_token')
            ?? session('meta_access_token');

        if (!$accessToken) {
            return response()->json(['error' => 'Access token not found'], 401);
        }

        try {
            $pages = $this->metaService->getUserPages($accessToken);
            
            // For each page, check if it has an Instagram account
            $pagesWithInstagram = [];
            foreach ($pages as $page) {
                $pageData = $page;
                try {
                    $instagramAccount = $this->metaService->getPageInstagramAccount($page['id'], $page['access_token']);
                    $pageData['instagram_account'] = $instagramAccount;
                } catch (\Exception $e) {
                    $pageData['instagram_account'] = null;
                }
                $pagesWithInstagram[] = $pageData;
            }

            return response()->json(['pages' => $pagesWithInstagram]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch pages',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getInstagramAccounts(Request $request): JsonResponse
    {
        $accessToken = $request->query('access_token') 
            ?? $request->input('access_token')
            ?? session('meta_access_token');

        if (!$accessToken) {
            return response()->json(['error' => 'Access token not found'], 401);
        }

        try {
            $pages = $this->metaService->getUserPages($accessToken);
            $instagramAccounts = [];

            foreach ($pages as $page) {
                try {
                    $instagramAccount = $this->metaService->getPageInstagramAccount($page['id'], $page['access_token']);
                    if ($instagramAccount) {
                        $instagramAccounts[] = [
                            'instagram_account_id' => $instagramAccount['id'],
                            'username' => $instagramAccount['username'] ?? 'Unknown',
                            'page_id' => $page['id'],
                            'page_name' => $page['name'],
                            'access_token' => $page['access_token'],
                        ];
                    }
                } catch (\Exception $e) {
                    // Skip pages without Instagram accounts
                    continue;
                }
            }

            return response()->json(['instagram_accounts' => $instagramAccounts]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch Instagram accounts',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getWhatsAppAccounts(Request $request): JsonResponse
    {
        $accessToken = $request->query('access_token') 
            ?? $request->input('access_token')
            ?? session('meta_access_token');

        if (!$accessToken) {
            return response()->json(['error' => 'Access token not found'], 401);
        }

        try {
            $businesses = $this->metaService->getWhatsAppBusinessAccounts($accessToken);
            
            return response()->json(['whatsapp_accounts' => $businesses]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch WhatsApp accounts',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

