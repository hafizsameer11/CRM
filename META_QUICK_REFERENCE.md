# 🚀 Meta Integration - Quick Reference

## Required Credentials

```env
# Required for ALL integrations
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_VERIFY_TOKEN=random_secure_string

# Optional (only for WhatsApp)
WHATSAPP_PHONE_ID=phone_number_id
WHATSAPP_BUSINESS_ID=business_account_id
WHATSAPP_VERIFY_TOKEN=random_secure_string
```

## Where to Get Credentials

1. **Go to:** https://developers.facebook.com/apps/
2. **Create/Select App** → **Settings** → **Basic**
3. **Copy App ID & App Secret**
4. **Generate verify tokens:** `openssl rand -hex 32`

## Required Meta App Products

✅ **Facebook Login** - For OAuth flow
✅ **Instagram** - For Instagram integration
✅ **WhatsApp** - For WhatsApp integration (optional)

## Required Permissions

### Facebook:
- `pages_manage_posts`
- `pages_manage_engagement`
- `pages_read_engagement`
- `pages_manage_metadata`
- `pages_messaging`

### Instagram:
- `instagram_basic`
- `instagram_manage_messages`
- `instagram_content_publish` (for posting)

### WhatsApp:
- `whatsapp_business_messaging`
- `whatsapp_business_management`

## OAuth Redirect URI

```
http://localhost:8000/api/meta/connect/callback
https://your-domain.com/api/meta/connect/callback
```

## Webhook URLs

### Facebook/Instagram:
```
https://your-domain.com/api/webhooks/meta
Verify Token: META_VERIFY_TOKEN
Subscribe to: messages, messaging_postbacks, message_deliveries, message_reads
```

### WhatsApp:
```
https://your-domain.com/api/webhooks/whatsapp
Verify Token: WHATSAPP_VERIFY_TOKEN
Subscribe to: messages, message_status
```

## Services Implemented

✅ **FacebookService** - Messages, Posts, Comments, Insights
✅ **InstagramService** - DMs, Posts, Comments, Insights
✅ **WhatsAppService** - Messages, Templates
✅ **MetaOAuthService** - OAuth flow, Token management

## Quick Test

1. Add credentials to `.env`
2. Run: `php artisan config:clear`
3. Login to tenant app
4. Go to **Integrations** → Click **"Connect Facebook"**
5. Authorize → Should redirect back successfully!

---

📘 **Full Guide:** See `META_SETUP_GUIDE.md` for detailed instructions.

