<?php

namespace App\Services\Meta;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class MetaOAuthService
{
    private string $appId;
    private string $appSecret;
    private string $redirectUri;

    public function __construct()
    {
        // Get settings from database, fallback to config
        $appIdSetting = Setting::getSystem('META_APP_ID');
        $this->appId = is_string($appIdSetting) ? $appIdSetting : (is_array($appIdSetting) ? ($appIdSetting['value'] ?? null) : null);
        $this->appId = $this->appId ?? config('services.meta.app_id');
        
        if (!$this->appId) {
            throw new \Exception('META_APP_ID is not configured. Please add it to settings or .env file.');
        }
        
        $appSecretSetting = Setting::getSystem('META_APP_SECRET');
        $this->appSecret = is_string($appSecretSetting) ? $appSecretSetting : (is_array($appSecretSetting) ? ($appSecretSetting['value'] ?? null) : null);
        $this->appSecret = $this->appSecret ?? config('services.meta.app_secret');
        
        if (!$this->appSecret) {
            throw new \Exception('META_APP_SECRET is not configured. Please add it to settings or .env file.');
        }
        
        // Ensure redirect URI is properly formatted
        // Default to localhost:8000 for development
        $baseUrl = config('app.url', 'http://localhost:8000');
        // Remove trailing slash if present
        $baseUrl = rtrim($baseUrl, '/');
        // Ensure we have the correct port for local development
        if (str_contains($baseUrl, 'localhost') && !str_contains($baseUrl, ':')) {
            $baseUrl = 'http://localhost:8000';
        }
        $this->redirectUri = $baseUrl . '/api/meta/connect/callback';
        
        // Log redirect URI for debugging
        \Log::info('Meta OAuth Service initialized', [
            'app_id' => $this->appId,
            'redirect_uri' => $this->redirectUri,
        ]);
    }

    public function getAuthorizationUrl(array $scopes = [], ?string $state = null): string
    {
        // Development-friendly scopes that work without App Review
        // These are basic permissions available in Development mode
        // Note: Advanced permissions like pages_manage_posts require App Review for production
        $defaultScopes = [
            'pages_show_list',        // List user's Facebook pages (works in dev mode)
            'pages_read_engagement',  // Read page engagement (works in dev mode)
            'pages_messaging',        // Send/receive messages (works in dev mode)
            'public_profile',         // Basic profile info (always available)
            'email',                  // User email (always available)
        ];

        // Merge with any additional scopes passed in
        $scopes = array_merge($defaultScopes, $scopes);
        $scopes = array_unique($scopes); // Remove duplicates
        
        // Filter out empty scopes
        $scopes = array_filter($scopes);

        // Build OAuth URL with properly encoded parameters
        $params = [
            'client_id' => $this->appId,
            'redirect_uri' => $this->redirectUri,
            'scope' => implode(',', $scopes),
            'response_type' => 'code',
        ];
        
        // Add state if provided (use csrf_token as fallback for security)
        if ($state) {
            $params['state'] = $state;
        } else {
            $params['state'] = csrf_token();
        }

        // Use RFC 3986 encoding for proper URL encoding
        $queryString = http_build_query($params, '', '&', PHP_QUERY_RFC3986);

        return "https://www.facebook.com/v18.0/dialog/oauth?{$queryString}";
    }

    public function exchangeCodeForToken(string $code): array
    {
        $response = Http::get('https://graph.facebook.com/v18.0/oauth/access_token', [
            'client_id' => $this->appId,
            'client_secret' => $this->appSecret,
            'redirect_uri' => $this->redirectUri,
            'code' => $code,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to exchange code for token: ' . $response->body());
        }

        return $response->json();
    }

    public function getLongLivedToken(string $shortLivedToken): array
    {
        $response = Http::get('https://graph.facebook.com/v18.0/oauth/access_token', [
            'grant_type' => 'fb_exchange_token',
            'client_id' => $this->appId,
            'client_secret' => $this->appSecret,
            'fb_exchange_token' => $shortLivedToken,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get long-lived token: ' . $response->body());
        }

        return $response->json();
    }

    public function getUserPages(string $accessToken): array
    {
        $response = Http::get('https://graph.facebook.com/v18.0/me/accounts', [
            'access_token' => $accessToken,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get user pages: ' . $response->body());
        }

        return $response->json()['data'] ?? [];
    }

    public function getPageInstagramAccount(string $pageId, string $accessToken): ?array
    {
        $response = Http::get("https://graph.facebook.com/v18.0/{$pageId}", [
            'fields' => 'instagram_business_account',
            'access_token' => $accessToken,
        ]);

        if (!$response->successful()) {
            return null;
        }

        $data = $response->json();
        return $data['instagram_business_account'] ?? null;
    }

    public function getWhatsAppBusinessAccounts(string $accessToken): array
    {
        $response = Http::get('https://graph.facebook.com/v18.0/me/businesses', [
            'access_token' => $accessToken,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to get WhatsApp business accounts: ' . $response->body());
        }

        return $response->json()['data'] ?? [];
    }

    public function refreshAccessToken(string $accessToken): array
    {
        $response = Http::get('https://graph.facebook.com/v18.0/oauth/access_token', [
            'grant_type' => 'fb_exchange_token',
            'client_id' => $this->appId,
            'client_secret' => $this->appSecret,
            'fb_exchange_token' => $accessToken,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to refresh token: ' . $response->body());
        }

        return $response->json();
    }
}

