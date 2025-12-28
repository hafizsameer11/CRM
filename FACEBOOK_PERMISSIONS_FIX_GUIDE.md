# 🔧 Complete Guide: Fixing Facebook "Invalid Scopes" Error

## ❌ Error You're Seeing

```
Invalid Scopes: pages_manage_posts. This message is only shown to developers. 
Users of your app will ignore these permissions if present.
```

## 🎯 Root Cause

The error occurs because:

1. **App Type Restriction**: Consumer-type apps cannot request `pages_*` permissions
2. **App Review Required**: Some permissions like `pages_manage_posts` require App Review approval
3. **Development Mode Limitations**: In Development mode, certain advanced permissions are restricted

---

## ✅ Solution: Step-by-Step Fix

### **Option 1: Quick Fix for Development (Recommended First Step)**

Use development-friendly scopes that work immediately without App Review.

**Updated scopes in your code (already applied):**
- ✅ `pages_show_list` - List user's pages
- ✅ `pages_read_engagement` - Read comments, reactions
- ✅ `pages_messaging` - Send/receive messages
- ✅ `public_profile` - Basic profile info
- ✅ `email` - User email

**Note**: These work in Development mode without App Review!

---

### **Option 2: Fix App Type (Required for Production)**

#### Step 1: Check Your App Type

1. Go to https://developers.facebook.com/apps/
2. Select your app (ID: `851090237886043`)
3. Go to **Settings** → **Basic**
4. Check **App Type** section

#### Step 2: Remove or Change App Type

**If your app is set to "Consumer":**
1. In **Settings** → **Basic**
2. Look for **App Type** section
3. If you see "Remove App Type" button, click it
4. OR change to **"Business"** type

**Why?** Consumer apps cannot request `pages_*` permissions. Business apps can.

---

### **Option 3: Request Permissions Through App Review (For Production)**

If you need `pages_manage_posts` for production:

#### Step 1: Prepare Your App

1. **Ensure App Type is "Business"** (see Option 2 above)
2. **Add required products:**
   - Facebook Login ✅
   - Instagram ✅ (if using Instagram)
   - WhatsApp ✅ (if using WhatsApp)

#### Step 2: Configure OAuth Redirect URI

1. Go to **Facebook Login** → **Settings**
2. Add to **Valid OAuth Redirect URIs**:
   ```
   http://localhost:8000/api/meta/connect/callback
   https://your-production-domain.com/api/meta/connect/callback
   ```
3. **Save Changes**

#### Step 3: Request Permissions

1. Go to **App Review** → **Permissions and Features**
2. Find each permission you need:
   - `pages_manage_posts`
   - `pages_manage_engagement`
   - `pages_read_engagement`
   - `pages_messaging`
   - `instagram_basic`
   - `instagram_manage_messages`
   - `instagram_content_publish`

3. For each permission:
   - Click **"Request"** or **"Add Permission"**
   - Fill in **Use Case**: Describe how your CRM uses this permission
   - Provide **Instructions**: Step-by-step how to test
   - Upload **Screencast**: Video showing the feature
   - **Submit for Review**

#### Step 4: Wait for Approval

- Review usually takes **1-7 business days**
- You'll get email notification when approved
- During review, you can still test with your own test accounts

---

## 🔍 Detailed Permission Requirements

### **Development Mode (No Review Required)**

These work immediately in Development mode:

✅ `pages_show_list` - List user's pages
✅ `pages_read_engagement` - Read comments, reactions, messages
✅ `pages_messaging` - Send/receive messages via Messenger
✅ `public_profile` - Basic profile info
✅ `email` - User email
✅ `instagram_basic` - Basic Instagram info

### **Requires App Review (For Production)**

These need App Review approval:

🔒 `pages_manage_posts` - Publish posts to pages
🔒 `pages_manage_engagement` - Reply to comments, manage engagement
🔒 `pages_manage_metadata` - Access page metadata
🔒 `instagram_manage_messages` - Send/receive Instagram DMs
🔒 `instagram_content_publish` - Publish Instagram posts

---

## 📋 Complete Setup Checklist

### ✅ **Phase 1: Development Setup (Do This First)**

- [ ] **App Type**: Set to "Business" or remove app type
- [ ] **Facebook Login Product**: Added and configured
- [ ] **OAuth Redirect URI**: Added (`http://localhost:8000/api/meta/connect/callback`)
- [ ] **Basic Permissions**: Using development-friendly scopes (already done in code)
- [ ] **Test User**: Add yourself as test user in App Dashboard → Roles → Test Users

**Result**: App should work in Development mode ✅

### ✅ **Phase 2: Production Setup (After Development Works)**

- [ ] **App Review**: Submit required permissions for review
- [ ] **Production OAuth URI**: Add production callback URL
- [ ] **Privacy Policy**: Add privacy policy URL (required for review)
- [ ] **Terms of Service**: Add terms URL (required for review)
- [ ] **App Icon**: Upload app icon (1024x1024px)
- [ ] **Screencast**: Create video showing your app's features

**Result**: App approved for production use ✅

---

## 🛠️ Code Changes Already Applied

The code has been updated to use development-friendly scopes:

```php
// backend/app/Services/Meta/MetaOAuthService.php
$defaultScopes = [
    'pages_show_list',        // ✅ Works in dev mode
    'pages_read_engagement',  // ✅ Works in dev mode
    'pages_messaging',        // ✅ Works in dev mode
    'public_profile',         // ✅ Always available
    'email',                  // ✅ Always available
];
```

---

## 🚀 Quick Test Steps

1. **Ensure App Type is "Business"**:
   - Go to Meta App Dashboard → Settings → Basic
   - Check/change App Type

2. **Configure OAuth Redirect**:
   - Facebook Login → Settings
   - Add: `http://localhost:8000/api/meta/connect/callback`

3. **Add Test User** (if needed):
   - App Dashboard → Roles → Test Users
   - Create test user or add yourself

4. **Test Connection**:
   - Go to your CRM → Integrations
   - Click "Connect Facebook"
   - Should work without errors now! ✅

---

## ⚠️ Important Notes

### **Development vs Production**

- **Development Mode**: Use basic scopes, works with test users only
- **Production Mode**: Requires App Review for advanced permissions

### **App Type Matters**

- ❌ **Consumer**: Cannot use `pages_*` permissions
- ✅ **Business**: Can use `pages_*` permissions (after review)
- ✅ **None**: Can request any permission (best for flexibility)

### **Permission Limitations**

Even after App Review approval:
- `pages_manage_posts` only works for pages the user manages
- User must grant permission during OAuth
- Permissions can be revoked by users anytime

---

## 🔄 If You Still Get Errors

### **Error: "Invalid Scopes"**

1. ✅ Check App Type (must be Business or None)
2. ✅ Verify scopes in code match what's in Meta Dashboard
3. ✅ Clear browser cache and cookies
4. ✅ Try OAuth flow again

### **Error: "Redirect URI Mismatch"**

1. ✅ Check OAuth Redirect URI in Meta Dashboard
2. ✅ Must match exactly (including http/https, port, path)
3. ✅ No trailing slashes

### **Error: "App Not in Development Mode"**

1. ✅ Go to App Dashboard → Settings → Basic
2. ✅ Change **App Mode** to **Development**
3. ✅ Save changes

---

## 📞 Need More Help?

### **Facebook Developer Resources**

- **Permissions Reference**: https://developers.facebook.com/docs/permissions/reference
- **App Review Guide**: https://developers.facebook.com/docs/app-review
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/ (test permissions here)

### **Common Issues**

- **"Permission denied"**: User didn't grant permission during OAuth
- **"Invalid token"**: Token expired, need to refresh
- **"Page not found"**: User doesn't have access to that page

---

## ✅ Summary

**For Immediate Fix (Development)**:
1. Change App Type to "Business" or remove it
2. Use development-friendly scopes (already updated in code)
3. Configure OAuth Redirect URI
4. Test with your own account

**For Production**:
1. Complete development setup first
2. Submit permissions for App Review
3. Wait for approval (1-7 days)
4. Switch app to Live mode
5. Deploy to production

**Your code has been updated to use development-friendly scopes that work immediately!** 🎉

---

*Last Updated: 2025-12-25*



