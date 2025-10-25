# CRM SaaS Backend - Production-Grade Laravel 11 Application

A comprehensive multi-tenant CRM system for managing Facebook, Instagram, and WhatsApp channels via Meta APIs.

## 🚀 Features

### Core Functionality
- ✅ **Multi-tenant Architecture** - Complete tenant isolation with secure data scoping
- ✅ **Super Admin Panel** - Full system oversight and management capabilities
- ✅ **Stripe Billing Integration** - Subscription management with metered usage tracking
- ✅ **Meta API Integration** - Facebook, Instagram, and WhatsApp channel management
- ✅ **OAuth 2.0 Flow** - Secure channel connection via Meta OAuth
- ✅ **Webhook Processing** - Signature validation, async processing, idempotency
- ✅ **Background Jobs** - Queue-based processing with Laravel Horizon
- ✅ **Audit Logging** - Comprehensive activity tracking with data scrubbing
- ✅ **Token Encryption** - All access tokens encrypted at rest
- ✅ **Rate Limiting** - Per-tenant and per-endpoint rate limits

### Security
- JWT-based authentication with separate guards (tenant users & admins)
- Encrypted token storage (access_token, refresh_token)
- Webhook signature validation (X-Hub-Signature-256)
- Sensitive data scrubbing in logs and audit trails
- Tenant-scoped queries to prevent data leakage
- Role-based access control (owner, manager, agent)

### Reliability
- Idempotent webhook processing (provider_message_id uniqueness)
- Automatic token refresh (55-day cycle via scheduled jobs)
- Failed job handling with retry logic
- Database transaction management
- Comprehensive error logging

## 📋 Prerequisites

- PHP 8.2+
- Composer
- MySQL 8.0+
- Redis 6.0+
- Node.js 18+ & NPM (for assets)

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
cd backend
composer install
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Configure your `.env` file:

```env
# Database
DB_CONNECTION=mysql
DB_DATABASE=crm_saas
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Redis (for queues & cache)
REDIS_HOST=127.0.0.1
QUEUE_CONNECTION=redis
CACHE_STORE=redis

# Stripe
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# Meta (Facebook/Instagram)
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_VERIFY_TOKEN=your_random_string

# WhatsApp
WHATSAPP_VERIFY_TOKEN=your_random_string
```

### 3. Database Setup

```bash
php artisan migrate
php artisan db:seed
```

This creates:
- All necessary tables
- Default admin user: `admin@example.com` / `password`
- Starter, Growth, and Pro plans

### 4. Start Services

**Option A: Development (Recommended)**
```bash
composer dev
```

This starts:
- Laravel server (port 8000)
- Queue worker
- Log viewer (Laravel Pail)
- Vite dev server

**Option B: Manual**
```bash
# Terminal 1: Application
php artisan serve

# Terminal 2: Queue Worker
php artisan queue:work --tries=3

# Terminal 3: Horizon (optional, better UI)
php artisan horizon
```

## 📡 API Endpoints

### Public Endpoints

#### Health Check
```http
GET /api/health
```

#### Authentication
```http
POST /api/auth/register
POST /api/auth/login
```

### Tenant Endpoints (Requires: `auth:api`)

#### User Management
```http
GET    /api/tenant/me
POST   /api/tenant/logout
GET    /api/tenant/users
POST   /api/tenant/users
PATCH  /api/tenant/users/{id}
DELETE /api/tenant/users/{id}
```

#### Channels
```http
GET    /api/tenant/channels
GET    /api/tenant/channels/{id}
DELETE /api/tenant/channels/{id}
POST   /api/tenant/channels/{id}/refresh-token
```

#### Conversations & Messages
```http
GET    /api/tenant/conversations
GET    /api/tenant/conversations/{id}
PATCH  /api/tenant/conversations/{id}
GET    /api/tenant/conversations/{conversation}/messages
POST   /api/tenant/conversations/{conversation}/messages
```

#### Billing (Owner only)
```http
GET  /api/tenant/billing/plans
POST /api/tenant/billing/subscribe
GET  /api/tenant/billing/subscription
POST /api/tenant/billing/subscription/cancel
GET  /api/tenant/billing/invoices
```

#### Meta OAuth
```http
GET  /api/meta/connect
GET  /api/meta/connect/callback
GET  /api/meta/pages
POST /api/meta/attach/facebook
POST /api/meta/attach/instagram
POST /api/meta/attach/whatsapp
```

### Admin Endpoints (Requires: `admin.auth`)

```http
POST   /api/admin/login
GET    /api/admin/health
GET    /api/admin/tenants
GET    /api/admin/tenants/{id}
PATCH  /api/admin/tenants/{id}/status
GET    /api/admin/usage
GET    /api/admin/settings
PATCH  /api/admin/settings
```

### Webhooks (No auth, signature validation)

```http
GET/POST /api/webhooks/meta
GET/POST /api/webhooks/whatsapp
POST     /api/webhooks/stripe
```

## 🎯 Scheduled Tasks

Configure in your crontab:
```bash
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

Tasks:
- **Daily 2:00 AM**: Refresh expiring Meta tokens
- **Daily 3:00 AM**: Clean up processed webhooks (>30 days)
- **Weekly Sunday 4:00 AM**: Archive old activity logs (>90 days)

## 🏗️ Architecture

### Directory Structure

```
app/
├── Console/Commands/          # CLI commands
│   └── RefreshExpiringTokens.php
├── Http/
│   ├── Controllers/Api/
│   │   ├── Admin/            # Super admin controllers
│   │   ├── Auth/             # Authentication controllers
│   │   ├── Meta/             # Meta OAuth controllers
│   │   ├── Tenant/           # Tenant-facing controllers
│   │   └── Webhooks/         # Webhook handlers
│   └── Middleware/
│       ├── TenantScope.php   # Automatic tenant filtering
│       ├── EnsureTenantActive.php
│       ├── CheckRole.php
│       └── ScrubSensitiveData.php
├── Jobs/
│   ├── ProcessMetaWebhook.php
│   ├── ProcessWhatsAppWebhook.php
│   ├── SendOutboundMessage.php
│   └── RefreshChannelToken.php
├── Models/                    # Eloquent models (13 models)
└── Services/
    ├── Facebook/
    ├── Instagram/
    ├── WhatsApp/
    └── Meta/
```

### Database Schema

**Core Tables:**
- `tenants` - Organizations
- `users` - Tenant users (owner/manager/agent)
- `admins` - Super admins
- `plans` - Subscription plans
- `subscriptions` - Active subscriptions

**Channel Management:**
- `channels` - Connected FB/IG/WA accounts
- `conversations` - Customer conversations
- `messages` - Inbound/outbound messages

**Operations:**
- `webhook_events` - Raw webhook payloads
- `audit_logs` - API call tracking
- `activity_logs` - User actions
- `usage_records` - Metered billing data
- `settings` - System/tenant configuration

## 🔐 Security Best Practices

### Token Storage
All access tokens are encrypted using Laravel's `Crypt::encrypt()`:
```php
// In Channel model
protected function accessToken(): Attribute
{
    return Attribute::make(
        get: fn ($value) => $value ? Crypt::decryptString($value) : null,
        set: fn ($value) => $value ? Crypt::encryptString($value) : null,
    );
}
```

### Webhook Validation
```php
private function verifySignature(Request $request): bool
{
    $signature = $request->header('X-Hub-Signature-256');
    $expected = 'sha256=' . hash_hmac('sha256', $request->getContent(), $appSecret);
    return hash_equals($expected, $signature);
}
```

### Tenant Data Isolation
```php
// TenantScope middleware automatically adds:
$query->where('tenant_id', auth()->user()->tenant_id);
```

## 🧪 Testing

```bash
# Run all tests
composer test

# With coverage
php artisan test --coverage
```

## 📊 Monitoring

### Laravel Horizon
Access queue monitoring at: `http://localhost:8000/horizon`

Features:
- Real-time job monitoring
- Failed job management
- Queue metrics and throughput

### Laravel Telescope (Development)
Access at: `http://localhost:8000/telescope`

Features:
- Request inspection
- Query profiling
- Exception tracking
- Log viewing

## 🚢 Deployment

### Requirements
- PHP 8.2+ with extensions: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- MySQL 8.0+
- Redis 6.0+
- Supervisor (for queue workers)

### Deployment Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
composer install --optimize-autoloader --no-dev
npm install && npm run build

# 3. Run migrations
php artisan migrate --force

# 4. Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Restart services
php artisan queue:restart
sudo supervisorctl restart all
```

### Supervisor Configuration

Create `/etc/supervisor/conf.d/crm-worker.conf`:

```ini
[program:crm-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasdefault=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/path/to/backend/storage/logs/worker.log
stopwaitsecs=3600
```

## 🛠️ Troubleshooting

### Queue Jobs Not Processing
```bash
# Check Redis connection
php artisan redis:ping

# Restart queue worker
php artisan queue:restart
```

### Token Refresh Failures
- Verify `META_APP_SECRET` in settings table or `.env`
- Check channel `expires_at` dates
- Review `audit_logs` for API errors

### Webhook Signature Validation Fails
- Ensure `META_APP_SECRET` matches Meta dashboard
- Check webhook URL is publicly accessible (use ngrok for local dev)
- Verify webhook payload hasn't been modified by proxies

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Stripe API](https://stripe.com/docs/api)

## 📝 License

Proprietary - All rights reserved

## 👥 Support

For technical support or questions, contact: support@example.com
