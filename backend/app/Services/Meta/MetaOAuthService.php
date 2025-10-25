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
        $this->appId = Setting::getSystem('META_APP_ID')['value'] ?? config('services.meta.app_id');
        $this->appSecret = Setting::getSystem('META_APP_SECRET')['value'] ?? config('services.meta.app_secret');
        $this->redirectUri = config('app.url') . '/api/meta/connect/callback';
    }

    public function getAuthorizationUrl(array $scopes = []): string
    {
        $defaultScopes = [
            'pages_manage_posts',
            'pages_manage_engagement',
            'pages_read_engagement',
            'pages_manage_metadata',
            'pages_messaging',
            'instagram_basic',
            'instagram_manage_messages',
            'whatsapp_business_messaging',
            'whatsapp_business_management',
        ];

        $scopes = array_merge($defaultScopes, $scopes);

        $params = http_build_query([
            'client_id' => $this->appId,
            'redirect_uri' => $this->redirectUri,
            'scope' => implode(',', $scopes),
            'response_type' => 'code',
            'state' => csrf_token(),
        ]);

        return "https://www.facebook.com/v18.0/dialog/oauth?{$params}";
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

