# 🔐 Test Credentials

## 👥 **Tenant App** (Main CRM Application)
**URL:** `http://localhost:5173`

```
Email: demo@crm.com
Password: password123
```

**Features Available:**
- ✅ Dashboard
- ✅ Inbox (Messages)
- ✅ Posts (Social Media Management) - NEW!
- ✅ Media Library - NEW!
- ✅ Analytics - NEW!
- ✅ Comments Moderation - NEW!
- ✅ Integrations (Connect Facebook/Instagram/WhatsApp)
- ✅ Billing (Stripe subscription)
- ✅ Settings

---

## 🛡️ **Admin Panel**
**URL:** `http://localhost:5174`

```
Email: admin@crm.com
Password: password123
```

**Features Available:**
- ✅ Dashboard (System overview)
- ✅ Tenants Management
- ✅ Usage Analytics
- ✅ Payments Tracking
- ✅ System Health
- ✅ Settings (API credentials)

---

## 🚀 **How to Start**

### 1. Start Backend
```bash
cd backend
php artisan serve
# Runs on http://localhost:8000
```

### 2. Start Tenant Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 3. Start Admin Panel
```bash
cd frontend/admin
npm install  # First time only
npm run dev
# Runs on http://localhost:5174
```

---

## 📝 **What's New**

### **Social Media Management Features**
Now your CRM is a full-fledged social media management platform!

#### **Posts** (`/posts`)
- Create and manage social media posts
- Schedule posts for later
- Publish immediately to Facebook/Instagram
- Track engagement (likes, comments, shares, reach)
- View post history and status

#### **Media Library** (`/media`)
- Upload images and videos
- Organize media files
- Reuse media across posts
- Auto-generate thumbnails

#### **Analytics** (`/analytics`)
- Track followers, reach, impressions
- Monitor engagement rates
- View top-performing posts
- Compare channel performance
- Historical trends

#### **Comments** (`/comments`)
- View all comments across channels
- Reply to comments
- Hide spam/inappropriate comments
- Delete harmful comments
- Track moderation activity

---

## 🔧 **Backend API Endpoints**

### **Posts**
```
GET    /api/tenant/posts                List posts
POST   /api/tenant/posts                Create post
PUT    /api/tenant/posts/{id}           Update post
DELETE /api/tenant/posts/{id}           Delete post
POST   /api/tenant/posts/{id}/publish   Publish now
POST   /api/tenant/posts/{id}/schedule  Schedule post
```

### **Media**
```
GET    /api/tenant/media         List media
POST   /api/tenant/media/upload  Upload file
DELETE /api/tenant/media/{id}    Delete media
```

### **Comments**
```
GET    /api/tenant/comments          List comments
POST   /api/tenant/comments/{id}/reply   Reply
POST   /api/tenant/comments/{id}/hide    Hide
DELETE /api/tenant/comments/{id}         Delete
```

### **Insights**
```
GET /api/tenant/insights               Get insights
GET /api/tenant/insights/summary       Summary
GET /api/tenant/insights/top-posts     Top posts
```

### **AI Content Generator**
```
POST /api/tenant/ai/generate-caption   Generate captions
POST /api/tenant/ai/generate-hashtags  Generate hashtags
```

---

## 📊 **Database Tables**

**Total:** 21 tables

**New Social Media Tables:**
- `posts` - Social media posts
- `media_assets` - Media library
- `scheduled_jobs` - Post scheduling
- `insights` - Analytics data
- `comments` - Comment moderation

---

## 🧪 **Testing the Features**

### **1. Test Post Creation**
1. Login to tenant app
2. Go to "Posts" in sidebar
3. Click "New Post"
4. Select a channel (you'll need to connect one first in Integrations)
5. Write caption
6. Upload media (optional)
7. Choose: Save Draft, Schedule, or Publish Now

### **2. Test Media Upload**
1. Go to "Media" in sidebar
2. Click "Upload"
3. Select image/video (max 100MB)
4. View in grid
5. Use in posts

### **3. Test Analytics**
1. Go to "Analytics" in sidebar
2. Select channel
3. Choose time period (7d, 30d, 90d)
4. View metrics and charts

### **4. Test Comments**
1. Go to "Comments" in sidebar
2. View all comments
3. Reply to a comment
4. Hide spam comments
5. Delete harmful comments

---

## 🎯 **Current Status**

### **Backend** ✅ 100% Complete
- 6 new tables migrated
- 5 new models created
- 25+ API endpoints ready
- Publishing services extended
- Queue jobs created
- All routes registered

### **Frontend** 🚧 60% Complete
- ✅ Navigation updated
- ✅ Routes added
- ✅ Posts page (basic structure)
- ⏳ Post Editor (placeholder)
- ⏳ Media Library (placeholder)
- ⏳ Analytics Dashboard (placeholder)
- ⏳ Comments Moderation (placeholder)

---

## 🔑 **API Keys Needed (Optional)**

To use AI features, set in Admin Panel → Settings:
- `OPENAI_API_KEY` - For AI caption generation

To connect social media, you need:
- `META_APP_ID` - Facebook/Instagram
- `META_APP_SECRET` - Facebook/Instagram
- `STRIPE_KEY` - Billing
- `STRIPE_SECRET` - Billing

---

## 📞 **Support**

All backend APIs are working and ready!
Frontend pages are accessible but some features are placeholders.

**Next Steps:**
- Complete Post Editor UI
- Build Media Library grid
- Create Analytics charts
- Implement Comments table

---

*Last Updated: 2025-10-22*

