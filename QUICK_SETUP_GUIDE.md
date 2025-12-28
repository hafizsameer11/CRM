# ⚡ Quick Setup Guide - Meta Integration

## 🎯 **3 Steps to Get Started**

### Step 1: Add Meta Credentials (Choose One)

**Option A: Run Seeder (Recommended)**
```bash
cd backend
php artisan db:seed --class=AddMetaCredentialsSeeder
```

**Option B: Add to .env**
```env
META_APP_ID=851090237886043
META_APP_SECRET=2e91c2844362b82180eb7ce0faefad08
```

### Step 2: Configure Meta App

1. Go to: https://developers.facebook.com/apps/
2. Select app: **851090237886043**
3. **Settings → Basic:**
   - Add OAuth Redirect URI: `http://localhost:8000/api/meta/connect/callback`
4. **App Review → Permissions:**
   - Request: `pages_manage_posts`, `pages_manage_engagement`, `pages_messaging`, `instagram_basic`, `instagram_manage_messages`

### Step 3: Test Connection

1. Start backend: `php artisan serve`
2. Start frontend: `npm run dev`
3. Login → Go to **Integrations** → Click **"Connect Facebook"**
4. Authorize → Select pages → Done! ✅

---

## ✅ **What's Already Done**

- ✅ Meta credentials seeder created
- ✅ OAuth flow fixed
- ✅ Page selection UI added
- ✅ Dashboard shows real data
- ✅ All code implemented

**You just need to run the seeder and configure Meta App!**

---

## 📚 **Full Documentation**

- **Complete Plan:** `META_INTEGRATION_COMPLETE_PLAN.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Meta Setup Guide:** `META_SETUP_GUIDE.md`

---

*Ready to go! 🚀*

