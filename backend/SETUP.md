# Quick Setup Guide

## Prerequisites Checklist

- [ ] PHP 8.2+ installed (`php -v`)
- [ ] Composer installed (`composer --version`)
- [ ] MySQL 8.0+ running
- [ ] Redis server running (`redis-cli ping`)
- [ ] Node.js 18+ & NPM installed

## Step-by-Step Setup

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret
```

### 2. Configure .env

Edit `.env` and set these required values:

```env
# Database
DB_DATABASE=crm_saas
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Redis (critical for queues)
REDIS_HOST=127.0.0.1
QUEUE_CONNECTION=redis

# JWT (auto-generated)
JWT_SECRET=<generated>

# Stripe (get from https://dashboard.stripe.com)
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create products in Stripe dashboard)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# Meta (get from https://developers.facebook.com)
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_VERIFY_TOKEN=random_string_for_webhooks

# WhatsApp
WHATSAPP_VERIFY_TOKEN=random_string_for_webhooks
```

### 3. Install Dependencies

```bash
# PHP dependencies
composer install

# Node dependencies (for Vite/assets)
npm install
```

### 4. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE crm_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
php artisan migrate

# Seed default data (admin user + plans)
php artisan db:seed
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `password`

### 5. Start Development Environment

**Option A: One Command (Recommended)**
```bash
composer dev
```

This starts all services:
- Laravel development server (http://localhost:8000)
- Queue worker (background jobs)
- Laravel Pail (log viewer)
- Vite dev server (assets)

**Option B: Individual Services**
```bash
# Terminal 1: Web Server
php artisan serve

# Terminal 2: Queue Worker
php artisan queue:work redis --tries=3

# Terminal 3: Scheduler (for cron jobs)
php artisan schedule:work

# Terminal 4: Assets (if needed)
npm run dev
```

### 6. Verify Installation

Test the API:

```bash
# Health check
curl http://localhost:8000/api/health

# Should return: {"ok":true,"timestamp":"..."}
```

Test admin login:

```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Should return JWT token
```

## 🔧 Meta App Configuration

### 1. Create Facebook App

1. Go to https://developers.facebook.com/apps/
2. Create a new app (Business type)
3. Add products: Facebook Login, Instagram, WhatsApp

### 2. Configure OAuth Redirect

Add this URL to "Valid OAuth Redirect URIs":
```
http://localhost:8000/api/meta/connect/callback
```

For production, use your actual domain.

### 3. Set Up Webhooks

#### Facebook/Instagram Webhooks

**Callback URL:**
```
https://your-domain.com/api/webhooks/meta
```

**Verify Token:** Use the value from `META_VERIFY_TOKEN` in your `.env`

**Subscribe to:**
- `messages`
- `messaging_postbacks`
- `message_deliveries`
- `message_reads`

#### WhatsApp Webhooks

**Callback URL:**
```
https://your-domain.com/api/webhooks/whatsapp
```

**Verify Token:** Use the value from `WHATSAPP_VERIFY_TOKEN` in your `.env`

**Subscribe to:**
- `messages`
- `message_status`

### 4. Local Development with ngrok

For webhook testing locally:

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start tunnel
ngrok http 8000

# Use the HTTPS URL for webhook configuration
# Example: https://abc123.ngrok.io/api/webhooks/meta
```

## 💳 Stripe Configuration

### 1. Create Products & Prices

In Stripe Dashboard (https://dashboard.stripe.com):

1. **Products** → **Add product**
2. Create three products:
   - **Starter**: $29/month
   - **Growth**: $99/month
   - **Pro**: $199/month
3. Copy the Price IDs (starts with `price_...`)
4. Add them to `.env`:
   ```env
   STRIPE_STARTER_PRICE_ID=price_...
   STRIPE_GROWTH_PRICE_ID=price_...
   STRIPE_PRO_PRICE_ID=price_...
   ```

### 2. Set Up Webhooks

**Endpoint URL:**
```
https://your-domain.com/api/webhooks/stripe
```

**Events to listen for:**
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Copy Webhook Secret:**
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📝 Common Issues

### Queue jobs not processing?

```bash
# Check Redis connection
php artisan redis:ping

# Clear queue
php artisan queue:clear

# Restart worker
php artisan queue:restart
```

### Database connection failed?

```bash
# Test connection
php artisan db:show

# Re-run migrations
php artisan migrate:fresh --seed
```

### JWT token invalid?

```bash
# Clear config cache
php artisan config:clear

# Regenerate JWT secret
php artisan jwt:secret --force
```

### Webhooks not receiving events?

1. Check webhook URL is publicly accessible
2. Verify signature validation (check app secret matches)
3. Review logs: `tail -f storage/logs/laravel.log`

## 🚀 Next Steps

1. **Test Tenant Registration:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123",
       "password_confirmation": "password123",
       "company_name": "Acme Inc"
     }'
   ```

2. **Connect a Facebook Page:**
   - Login as tenant user
   - Navigate to `/api/meta/connect`
   - Complete OAuth flow
   - Attach page via `/api/meta/attach/facebook`

3. **Monitor Queues:**
   - Visit http://localhost:8000/horizon (if using Horizon)
   - Or use `php artisan queue:monitor`

4. **Check System Health:**
   - Admin login
   - Visit `/api/admin/health`
   - Review system stats

## 📚 Documentation

- Full API documentation: See `README.md`
- Architecture details: See `ARCHITECTURE.md` (if available)
- Deployment guide: See `README.md` → Deployment section

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `tail -f storage/logs/laravel.log`
2. Review queue failed jobs: `php artisan queue:failed`
3. Check database: `php artisan db:show`
4. Verify environment: `php artisan about`

For additional support: support@example.com

