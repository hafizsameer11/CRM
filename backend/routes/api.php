<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\HealthController as AdminHealthController;
use App\Http\Controllers\Api\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\TenantController as AdminTenantController;
use App\Http\Controllers\Api\Admin\UsageController as AdminUsageController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Meta\ConnectController;
use App\Http\Controllers\Api\Tenant\BillingController;
use App\Http\Controllers\Api\Tenant\ChannelController;
use App\Http\Controllers\Api\Tenant\ConversationController;
use App\Http\Controllers\Api\Tenant\HealthController;
use App\Http\Controllers\Api\Tenant\MessageController;
use App\Http\Controllers\Api\Tenant\UserController;
use App\Http\Controllers\Api\Webhooks\MetaWebhookController;
use App\Http\Controllers\Api\Webhooks\StripeWebhookController;
use App\Http\Controllers\Api\Webhooks\WhatsAppWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check (public)
Route::get('/health', [HealthController::class, 'index'])->name('health');

// Webhooks (no auth required, signature validation in controller)
Route::prefix('webhooks')->name('webhooks.')->group(function () {
    // Meta (Facebook/Instagram) webhooks
    Route::match(['get', 'post'], '/meta', [MetaWebhookController::class, 'verify'])
        ->name('meta.verify');
    Route::post('/meta', [MetaWebhookController::class, 'handle'])
        ->name('meta.handle');

    // WhatsApp webhooks
    Route::match(['get', 'post'], '/whatsapp', [WhatsAppWebhookController::class, 'verify'])
        ->name('whatsapp.verify');
    Route::post('/whatsapp', [WhatsAppWebhookController::class, 'handle'])
        ->name('whatsapp.handle');

    // Stripe webhooks
    Route::post('/stripe', [StripeWebhookController::class, 'handle'])
        ->name('stripe.handle');
});

// Public Auth Routes
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', [RegisterController::class, 'register'])->name('register');
    Route::post('/login', [LoginController::class, 'login'])->name('login');
});

// Protected Tenant Routes
Route::middleware(['auth:api', 'tenant.active', 'tenant.scope', 'scrub.sensitive'])
    ->prefix('tenant')
    ->name('tenant.')
    ->group(function () {
        // Current user
        Route::get('/me', [LoginController::class, 'me'])->name('me');
        Route::post('/logout', [LoginController::class, 'logout'])->name('logout');
        Route::post('/refresh', [LoginController::class, 'refresh'])->name('refresh');

        // Dashboard
        Route::get('/dashboard/stats', [\App\Http\Controllers\Api\Tenant\DashboardController::class, 'stats'])
            ->name('dashboard.stats');

        // Profile
        Route::post('/change-password', [\App\Http\Controllers\Api\Tenant\ProfileController::class, 'changePassword'])
            ->name('change-password');
        Route::patch('/profile', [\App\Http\Controllers\Api\Tenant\ProfileController::class, 'updateProfile'])
            ->name('profile.update');

        // Users management (owner/manager only)
        Route::middleware(['role:owner,manager'])->group(function () {
            Route::apiResource('users', UserController::class);
        });

        // Channels
        Route::get('/channels', [ChannelController::class, 'index'])->name('channels.index');
        Route::get('/channels/{id}', [ChannelController::class, 'show'])->name('channels.show');
        Route::delete('/channels/{id}', [ChannelController::class, 'destroy'])
            ->middleware(['role:owner,manager'])
            ->name('channels.destroy');
        Route::post('/channels/{id}/refresh-token', [ChannelController::class, 'refreshToken'])
            ->middleware(['role:owner,manager'])
            ->name('channels.refresh-token');

        // Conversations
        Route::get('/conversations', [ConversationController::class, 'index'])->name('conversations.index');
        Route::get('/conversations/{id}', [ConversationController::class, 'show'])->name('conversations.show');
        Route::patch('/conversations/{id}', [ConversationController::class, 'update'])->name('conversations.update');

        // Messages
        Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index'])
            ->name('conversations.messages.index');
        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store'])
            ->middleware('throttle:60,1') // 60 messages per minute
            ->name('conversations.messages.store');
        Route::get('/conversations/{conversation}/messages/{id}', [MessageController::class, 'show'])
            ->name('conversations.messages.show');

        // Posts
        Route::prefix('posts')->name('posts.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Tenant\PostController::class, 'index'])->name('index');
            Route::post('/', [\App\Http\Controllers\Api\Tenant\PostController::class, 'store'])->name('store');
            Route::get('/{id}', [\App\Http\Controllers\Api\Tenant\PostController::class, 'show'])->name('show');
            Route::put('/{id}', [\App\Http\Controllers\Api\Tenant\PostController::class, 'update'])->name('update');
            Route::delete('/{id}', [\App\Http\Controllers\Api\Tenant\PostController::class, 'destroy'])->name('destroy');
            Route::post('/{id}/publish', [\App\Http\Controllers\Api\Tenant\PostController::class, 'publish'])->name('publish');
            Route::post('/{id}/schedule', [\App\Http\Controllers\Api\Tenant\PostController::class, 'schedule'])->name('schedule');
        });

        // Media Library
        Route::prefix('media')->name('media.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Tenant\MediaController::class, 'index'])->name('index');
            Route::post('/upload', [\App\Http\Controllers\Api\Tenant\MediaController::class, 'store'])->name('upload');
            Route::get('/{id}', [\App\Http\Controllers\Api\Tenant\MediaController::class, 'show'])->name('show');
            Route::delete('/{id}', [\App\Http\Controllers\Api\Tenant\MediaController::class, 'destroy'])->name('destroy');
        });

        // Comments
        Route::prefix('comments')->name('comments.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Tenant\CommentController::class, 'index'])->name('index');
            Route::get('/{id}', [\App\Http\Controllers\Api\Tenant\CommentController::class, 'show'])->name('show');
            Route::post('/{id}/reply', [\App\Http\Controllers\Api\Tenant\CommentController::class, 'reply'])->name('reply');
            Route::post('/{id}/hide', [\App\Http\Controllers\Api\Tenant\CommentController::class, 'hide'])->name('hide');
            Route::post('/{id}/unhide', [\App\Http\Controllers\Api\Tenant\CommentController::class, 'unhide'])->name('unhide');
            Route::delete('/{id}', [\App\Http\Controllers\Api\Tenant\CommentController::class, 'destroy'])->name('destroy');
            Route::post('/{id}/spam', [\App\Http\Controllers\Api\Tenant\CommentController::class, 'markAsSpam'])->name('spam');
        });

        // Insights / Analytics
        Route::prefix('insights')->name('insights.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Tenant\InsightController::class, 'index'])->name('index');
            Route::get('/summary', [\App\Http\Controllers\Api\Tenant\InsightController::class, 'summary'])->name('summary');
            Route::get('/top-posts', [\App\Http\Controllers\Api\Tenant\InsightController::class, 'topPosts'])->name('top-posts');
        });

        // AI Content Generator
        Route::prefix('ai')->name('ai.')->group(function () {
            Route::post('/generate-caption', [\App\Http\Controllers\Api\Tenant\AIController::class, 'generateCaption'])->name('generate-caption');
            Route::post('/generate-hashtags', [\App\Http\Controllers\Api\Tenant\AIController::class, 'generateHashtags'])->name('generate-hashtags');
        });

        // Billing (owner only)
        Route::middleware(['role:owner'])->prefix('billing')->name('billing.')->group(function () {
            Route::get('/plans', [BillingController::class, 'plans'])->name('plans');
            Route::post('/subscribe', [BillingController::class, 'subscribe'])->name('subscribe');
            Route::get('/subscription', [BillingController::class, 'currentSubscription'])->name('subscription');
            Route::post('/subscription/cancel', [BillingController::class, 'cancelSubscription'])->name('subscription.cancel');
            Route::post('/subscription/resume', [BillingController::class, 'resumeSubscription'])->name('subscription.resume');
            Route::post('/payment-method', [BillingController::class, 'updatePaymentMethod'])->name('payment-method');
            Route::get('/invoices', [BillingController::class, 'invoices'])->name('invoices');
        });
    });

// Meta OAuth Routes
Route::prefix('meta')->name('meta.')->group(function () {
    // OAuth flow (handles auth manually via query token for redirect flow)
    Route::get('/connect', [ConnectController::class, 'redirectToProvider'])->name('connect');
    Route::get('/connect/callback', [ConnectController::class, 'handleCallback'])->name('callback');
    
    // Routes that can accept access_token from query (for OAuth flow) or JWT
    Route::get('/pages', [ConnectController::class, 'getPages'])->name('pages');
    Route::get('/instagram-accounts', [ConnectController::class, 'getInstagramAccounts'])->name('instagram.accounts');
    Route::get('/whatsapp-accounts', [ConnectController::class, 'getWhatsAppAccounts'])->name('whatsapp.accounts');
    
    // Protected routes (require JWT for attaching)
    Route::middleware(['auth:api', 'tenant.scope'])->group(function () {
        Route::post('/attach/facebook', [ConnectController::class, 'attachFacebookPage'])->name('attach.facebook');
        Route::post('/attach/instagram', [ConnectController::class, 'attachInstagramAccount'])->name('attach.instagram');
        Route::post('/attach/whatsapp', [ConnectController::class, 'attachWhatsAppNumber'])->name('attach.whatsapp');
    });
});

// Admin Routes
Route::prefix('admin')->name('admin.')->group(function () {
    // Admin auth
    Route::post('/login', [AdminAuthController::class, 'login'])->name('login');

    // Protected admin routes
    Route::middleware(['admin.auth'])->group(function () {
        Route::get('/me', [AdminAuthController::class, 'me'])->name('me');
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
        Route::post('/refresh', [AdminAuthController::class, 'refresh'])->name('refresh');

        // Health & system overview
        Route::get('/health', [AdminHealthController::class, 'index'])->name('health');
        
        // Content statistics
        Route::get('/content-stats', [AdminDashboardController::class, 'contentStats'])->name('content-stats');
        Route::get('/content-stats/by-tenant', [AdminDashboardController::class, 'contentStatsByTenant'])->name('content-stats.by-tenant');

        // Tenants management
        Route::get('/tenants', [AdminTenantController::class, 'index'])->name('tenants.index');
        Route::get('/tenants/{id}', [AdminTenantController::class, 'show'])->name('tenants.show');
        Route::patch('/tenants/{id}/status', [AdminTenantController::class, 'updateStatus'])->name('tenants.update-status');
        Route::delete('/tenants/{id}', [AdminTenantController::class, 'destroy'])->name('tenants.destroy');

        // Plans management
        Route::get('/plans', [AdminPlanController::class, 'index'])->name('plans.index');
        Route::get('/plans/{id}', [AdminPlanController::class, 'show'])->name('plans.show');
        Route::post('/plans', [AdminPlanController::class, 'store'])->name('plans.store');
        Route::patch('/plans/{id}', [AdminPlanController::class, 'update'])->name('plans.update');
        Route::delete('/plans/{id}', [AdminPlanController::class, 'destroy'])->name('plans.destroy');

        // Usage & analytics
        Route::get('/usage', [AdminUsageController::class, 'index'])->name('usage.index');
        Route::get('/usage/tenant/{tenant}', [AdminUsageController::class, 'tenant'])->name('usage.tenant');

        // System settings
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::get('/settings/{key}', [AdminSettingsController::class, 'show'])->name('settings.show');
        Route::patch('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
    });
});

