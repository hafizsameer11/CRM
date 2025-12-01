# 📘 Meta (Facebook) Integration Setup Guide

Complete guide for setting up Facebook, Instagram, and WhatsApp integrations.

---

## 🔑 Required Credentials

### 1. **Meta App Credentials** (Required for ALL integrations)

These are stored in your `.env` file or Admin Settings:

```env
META_APP_ID=your_facebook_app_id
META_APP_SECRET=your_facebook_app_secret
META_VERIFY_TOKEN=your_random_secure_string_for_webhooks
```

**Where to get them:**
1. Go to https://developers.facebook.com/apps/
2. Create or select your app
3. Go to **Settings** → **Basic**
4. Copy **App ID** → `META_APP_ID`
5. Copy **App Secret** → `META_APP_SECRET` (click "Show" to reveal)
6. Generate a random string for `META_VERIFY_TOKEN` (e.g., `openssl rand -hex 32`)

### 2. **WhatsApp-Specific Credentials** (Optional, only if using WhatsApp)

```env
WHATSAPP_PHONE_ID=your_whatsapp_phone_number_id
WHATSAPP_BUSINESS_ID=your_whatsapp_business_account_id
WHATSAPP_VERIFY_TOKEN=your_random_secure_string_for_whatsapp_webhooks
```

**Where to get them:**
1. In Meta App Dashboard → **WhatsApp** product
2. Go to **API Setup**
3. Copy **Phone number ID** → `WHATSAPP_PHONE_ID`
4. Copy **Business account ID** → `WHATSAPP_BUSINESS_ID`
5. Generate verify token → `WHATSAPP_VERIFY_TOKEN`

---

## 🛠️ Meta App Configuration Steps

### Step 1: Create Facebook App

1. **Go to:** https://developers.facebook.com/apps/
2. **Click:** "Create App"
3. **Select App Type:** Choose **"Business"** (required for Pages, Instagram, WhatsApp)
4. **Fill in:**
   - App Name: `Your CRM SaaS`
   - App Contact Email: Your email
   - Business Account: Select or create one
5. **Click:** "Create App"

---

### Step 2: Add Required Products

In your app dashboard, add these **Products**:

#### ✅ **Facebook Login** (Required for OAuth)
1. Click **"Add Product"** → Find **"Facebook Login"**
2. Click **"Set Up"**
3. **Settings:**
   - **Valid OAuth Redirect URIs:** Add:
     ```
     http://localhost:8000/api/meta/connect/callback
     https://your-production-domain.com/api/meta/connect/callback
     ```
   - **Deauthorize Callback URL:** (Optional)
     ```
     https://your-domain.com/api/meta/deauthorize
     ```
4. **Save Changes**

#### ✅ **Instagram** (Required for Instagram integration)
1. Click **"Add Product"** → Find **"Instagram"**
2. Click **"Set Up"**
3. **Basic Display API** (for basic access)
4. **Instagram Graph API** (for business accounts)
   - Requires Facebook Page connected to Instagram Business account

#### ✅ **WhatsApp** (Required for WhatsApp integration)
1. Click **"Add Product"** → Find **"WhatsApp"**
2. Click **"Set Up"**
3. **Get Started:**
   - You'll need a Meta Business Account
   - Phone number will be provided by Meta (or use your own)
4. **API Setup:**
   - Copy **Phone number ID** → Add to `.env` as `WHATSAPP_PHONE_ID`
   - Copy **Business account ID** → Add to `.env` as `WHATSAPP_BUSINESS_ID`

---

### Step 3: Configure Permissions & Scopes

Go to **App Review** → **Permissions and Features**

#### Required Permissions (Request Access):

**For Facebook Pages:**
- ✅ `pages_manage_posts` - Publish posts to pages
- ✅ `pages_manage_engagement` - Reply to comments, manage engagement
- ✅ `pages_read_engagement` - Read comments, reactions
- ✅ `pages_manage_metadata` - Access page metadata
- ✅ `pages_messaging` - Send/receive messages via Messenger
- ✅ `pages_show_list` - List user's pages

**For Instagram:**
- ✅ `instagram_basic` - Basic Instagram account info
- ✅ `instagram_manage_messages` - Send/receive Instagram DMs
- ✅ `instagram_manage_comments` - Manage comments (if needed)
- ✅ `instagram_content_publish` - Publish posts (requires Business account)

**For WhatsApp:**
- ✅ `whatsapp_business_messaging` - Send/receive WhatsApp messages
- ✅ `whatsapp_business_management` - Manage WhatsApp Business account

#### How to Request Permissions:

1. Go to **App Review** → **Permissions and Features**
2. Find each permission above
3. Click **"Request"** or **"Add"**
4. Fill in:
   - **Use Case:** Describe how your app uses this permission
   - **Instructions:** Step-by-step how to test
   - **Screencast:** Video showing the feature
5. **Submit for Review** (can take 1-7 days)

**Note:** For development, you can use permissions with your own test accounts without review. For production, all permissions must be approved.

---

### Step 4: Configure Webhooks

#### A. Facebook/Instagram Webhooks

1. Go to **Webhooks** in your app dashboard
2. Click **"Add Callback URL"**
3. **Callback URL:**
   ```
   https://your-domain.com/api/webhooks/meta
   ```
   For local testing with ngrok:
   ```
   https://abc123.ngrok.io/api/webhooks/meta
   ```
4. **Verify Token:** Use your `META_VERIFY_TOKEN` from `.env`
5. **Subscribe to Objects:**

   **Page Subscriptions (for basic functionality):**
   - ✅ `messages` - Incoming messages
   - ✅ `messaging_postbacks` - Button clicks
   - ✅ `message_deliveries` - Delivery receipts
   - ✅ `message_reads` - Read receipts
   - ✅ `messaging_optins` - User opt-ins (optional)
   - ✅ `messaging_optouts` - User opt-outs (optional)
   
   **Additional subscriptions (optional, for advanced features):**
   - `messaging_handovers` - Handover protocol
   - `messaging_policy_enforcement` - Policy violations
   - `messaging_account_linking` - Account linking
   - `messaging_referrals` - Referral messages

   **Instagram Subscriptions:**
   - ✅ `messages` - Instagram DMs
   - ✅ `messaging_postbacks` - Button clicks
   - ✅ `message_deliveries` - Delivery receipts
   - ✅ `message_reads` - Read receipts

6. **Click "Verify and Save"**

#### B. WhatsApp Webhooks

1. Go to **WhatsApp** product → **Configuration** → **Webhooks**
2. **Callback URL:**
   ```
   https://your-domain.com/api/webhooks/whatsapp
   ```
3. **Verify Token:** Use your `WHATSAPP_VERIFY_TOKEN` from `.env`
4. **Subscribe to Fields:**
   - ✅ `messages` - Incoming messages
   - ✅ `message_status` - Delivery/read status
5. **Click "Verify and Save"**

---

### Step 5: Connect Instagram Business Account

**Prerequisites:**
- You must have a Facebook Page
- Instagram account must be converted to **Business** or **Creator** account
- Instagram account must be connected to the Facebook Page

**Steps:**
1. Go to your Facebook Page → **Settings** → **Instagram**
2. Click **"Connect Account"**
3. Log in to your Instagram account
4. Confirm connection
5. The Instagram Business Account ID will be available via API

---

### Step 6: Set Up WhatsApp Business Account

1. In Meta App Dashboard → **WhatsApp** product
2. **Get Started:**
   - If you don't have a phone number, Meta will provide a test number
   - For production, you can:
     - Use Meta's phone number (requires approval)
     - Use your own phone number (requires verification)
3. **API Setup:**
   - Copy **Phone number ID** → `WHATSAPP_PHONE_ID`
   - Copy **Business account ID** → `WHATSAPP_BUSINESS_ID`
4. **Message Templates:**
   - Create message templates for outbound messages
   - Templates must be approved before use

---

## 🔧 Services Implemented in Code

### ✅ **Facebook Service** (`FacebookService.php`)

**Capabilities:**
- ✅ Send messages via Messenger
- ✅ Get conversations
- ✅ Publish posts (text, photo, video)
- ✅ Get post insights (impressions, reach)
- ✅ Get page insights
- ✅ Reply to comments
- ✅ Hide/delete comments

**API Endpoints Used:**
- `POST /{page_id}/messages` - Send message
- `GET /{conversation_id}` - Get conversation
- `POST /{page_id}/feed` - Publish text post
- `POST /{page_id}/photos` - Publish photo
- `POST /{page_id}/videos` - Publish video
- `GET /{post_id}/insights` - Get post metrics
- `GET /{page_id}/insights` - Get page metrics
- `POST /{comment_id}/comments` - Reply to comment
- `POST /{comment_id}` - Hide comment
- `DELETE /{comment_id}` - Delete comment

---

### ✅ **Instagram Service** (`InstagramService.php`)

**Capabilities:**
- ✅ Send messages via Instagram DM
- ✅ Get conversations
- ✅ Publish posts (photo/video required)
- ✅ Get media insights
- ✅ Get account insights
- ✅ Reply to comments
- ✅ Hide/delete comments

**API Endpoints Used:**
- `POST /{instagram_account_id}/messages` - Send DM
- `GET /{conversation_id}` - Get conversation
- `POST /{instagram_account_id}/media` - Create media container
- `POST /{instagram_account_id}/media_publish` - Publish post
- `GET /{media_id}/insights` - Get media metrics
- `GET /{instagram_account_id}/insights` - Get account metrics
- `POST /{comment_id}/replies` - Reply to comment
- `POST /{comment_id}` - Hide comment
- `DELETE /{comment_id}` - Delete comment

---

### ✅ **WhatsApp Service** (`WhatsAppService.php`)

**Capabilities:**
- ✅ Send text messages
- ✅ Send media messages (image, video, document)
- ✅ Send message templates (for outbound)

**API Endpoints Used:**
- `POST /{phone_number_id}/messages` - Send message
- Message types: `text`, `image`, `video`, `document`, `template`

---

### ✅ **Meta OAuth Service** (`MetaOAuthService.php`)

**Capabilities:**
- ✅ Generate OAuth authorization URL
- ✅ Exchange code for short-lived token
- ✅ Exchange short-lived token for long-lived token (60 days)
- ✅ Get user's Facebook pages
- ✅ Get Instagram Business account linked to page
- ✅ Get WhatsApp Business accounts
- ✅ Refresh access tokens

**OAuth Flow:**
1. User clicks "Connect Facebook"
2. Redirects to Facebook OAuth
3. User authorizes app
4. Facebook redirects to `/api/meta/connect/callback` with code
5. Backend exchanges code for token
6. Backend exchanges for long-lived token
7. Backend stores token in session
8. Frontend can now fetch pages and attach channels

---

## 📋 Summary Checklist

### ✅ Credentials Required

- [ ] `META_APP_ID` - From Facebook App Dashboard
- [ ] `META_APP_SECRET` - From Facebook App Dashboard
- [ ] `META_VERIFY_TOKEN` - Random secure string
- [ ] `WHATSAPP_PHONE_ID` - From WhatsApp product (if using WhatsApp)
- [ ] `WHATSAPP_BUSINESS_ID` - From WhatsApp product (if using WhatsApp)
- [ ] `WHATSAPP_VERIFY_TOKEN` - Random secure string (if using WhatsApp)

### ✅ Meta App Setup

- [ ] Create Facebook App (Business type)
- [ ] Add Facebook Login product
- [ ] Add Instagram product
- [ ] Add WhatsApp product (if needed)
- [ ] Configure OAuth redirect URI
- [ ] Request required permissions
- [ ] Set up webhooks (Facebook/Instagram)
- [ ] Set up webhooks (WhatsApp, if using)
- [ ] Connect Instagram Business account to Facebook Page
- [ ] Set up WhatsApp Business account

### ✅ Permissions to Request

**Facebook:**
- [ ] `pages_manage_posts`
- [ ] `pages_manage_engagement`
- [ ] `pages_read_engagement`
- [ ] `pages_manage_metadata`
- [ ] `pages_messaging`

**Instagram:**
- [ ] `instagram_basic`
- [ ] `instagram_manage_messages`
- [ ] `instagram_content_publish` (for posting)

**WhatsApp:**
- [ ] `whatsapp_business_messaging`
- [ ] `whatsapp_business_management`

### ✅ Webhook Subscriptions

**Facebook/Instagram:**
- [ ] `messages`
- [ ] `messaging_postbacks`
- [ ] `message_deliveries`
- [ ] `message_reads`

**WhatsApp:**
- [ ] `messages`
- [ ] `message_status`

---

## 🚀 Quick Start (Development)

### 1. Get Credentials

```bash
# Generate verify tokens
openssl rand -hex 32  # For META_VERIFY_TOKEN
openssl rand -hex 32  # For WHATSAPP_VERIFY_TOKEN
```

### 2. Add to `.env`

```env
META_APP_ID=1234567890123456
META_APP_SECRET=abcdef1234567890abcdef1234567890
META_VERIFY_TOKEN=your_generated_token_here

# Optional (for WhatsApp)
WHATSAPP_PHONE_ID=123456789012345
WHATSAPP_BUSINESS_ID=987654321098765
WHATSAPP_VERIFY_TOKEN=your_whatsapp_token_here
```

### 3. Set OAuth Redirect in Meta Dashboard

```
http://localhost:8000/api/meta/connect/callback
```

### 4. For Local Webhook Testing

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start tunnel
ngrok http 8000

# Use the HTTPS URL in Meta webhook settings:
# https://abc123.ngrok.io/api/webhooks/meta
```

### 5. Test Connection

1. Login to your tenant app
2. Go to **Integrations** page
3. Click **"Connect Facebook"**
4. Authorize the app
5. You should be redirected back with success!

---

## 🔍 Troubleshooting

### "Invalid OAuth redirect URI"
- ✅ Check redirect URI in Meta Dashboard matches exactly
- ✅ Must be HTTPS in production
- ✅ No trailing slashes

### "Invalid App Secret"
- ✅ Copy App Secret again from Meta Dashboard
- ✅ Make sure no extra spaces
- ✅ Clear Laravel config cache: `php artisan config:clear`

### "Permissions not granted"
- ✅ Check App Review status
- ✅ For development, add yourself as a test user
- ✅ Request permissions in App Review

### "Webhook verification failed"
- ✅ Verify token must match exactly
- ✅ Check `META_VERIFY_TOKEN` in `.env`
- ✅ Clear config cache: `php artisan config:clear`

### "Instagram account not found"
- ✅ Instagram account must be Business/Creator
- ✅ Must be connected to Facebook Page
- ✅ Page must be connected to your app

---

## 📚 Additional Resources

- **Meta Developers Docs:** https://developers.facebook.com/docs/
- **Facebook Graph API:** https://developers.facebook.com/docs/graph-api
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **WhatsApp Business API:** https://developers.facebook.com/docs/whatsapp
- **App Review Guide:** https://developers.facebook.com/docs/app-review

---

## ✅ Status

All services are **fully implemented** in the codebase:

- ✅ OAuth flow
- ✅ Facebook messaging & posting
- ✅ Instagram messaging & posting
- ✅ WhatsApp messaging
- ✅ Webhook handling
- ✅ Token refresh
- ✅ Comment moderation
- ✅ Analytics/insights

**You just need to configure the Meta App and add credentials!** 🎉

