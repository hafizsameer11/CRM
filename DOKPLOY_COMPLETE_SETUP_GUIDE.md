# 🚀 Complete Dokploy Setup Guide for CRM SaaS

This guide covers **EVERY** setting and option in Dokploy for deploying your CRM application.

---

## 📋 Prerequisites

- ✅ Dokploy installed and running
- ✅ GitHub repository connected
- ✅ Database service available (MySQL/PostgreSQL)
- ✅ Redis service available (optional but recommended)

---

## 🔧 STEP 1: Create New Application

1. Go to **Applications** → **New Application**
2. **Application Name**: `CRM SaaS` (or your preferred name)
3. Click **Create**

---

## 📦 STEP 2: Provider Settings (Source Code)

### 2.1 Source Code Selection
- **Select**: `Github` (blue checkmark)
- Other options (Gitlab, Bitbucket, etc.) are NOT selected

### 2.2 Github Account
- **Github Account**: `Dokploy-2025-12-14-rqm003` (or your connected account)
- If not connected, click to connect your GitHub account

### 2.3 Repository Configuration
- **Repository**: `CRM` (your repository name)
- **Branch**: `main` (or `master` if that's your default branch)
- **Build Path**: `Dockerfile` (exactly this, no path prefix)

### 2.4 Trigger Settings
- **Trigger Type**: `On Push` (deploys automatically on git push)
- **Watch Paths**: Leave **EMPTY** (or add specific paths like `frontend/**`, `backend/**` if you want to watch only certain folders)
- **Enable Submodules**: **OFF** (toggle switch grayed out)

---

## 🏗️ STEP 3: Build Type Settings

### 3.1 Build Type Selection
- **Select**: `Dockerfile` (radio button selected)
- Other options (Railpack, Nixpacks, etc.) are **NOT** selected

### 3.2 Dockerfile Configuration
- **Docker File**: `Dockerfile` (exactly this)
- **Docker Context Path**: `.` (single dot - means root directory)
- **Docker Build Stage**: `production` (targets the production stage in multi-stage Dockerfile)

**Important Notes:**
- Docker Context Path `.` means the build context is the repository root
- Docker Build Stage `production` tells Docker to build only the final production stage
- This reduces build time and image size

---

## 🌍 STEP 4: Environment Variables

Go to **Environment Variables** section and add these:

### 4.1 Application Settings
```env
APP_NAME=CRM SaaS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
```
**Replace `your-domain.com` with your actual domain!**

### 4.2 Database Configuration
```env
DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=crm
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
```

**If using Dokploy's database service:**
- DB_HOST: Use the service name (e.g., `mysql` or `postgres`)
- Or use external database IP/hostname

### 4.3 Redis Configuration (Optional but Recommended)
```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

**If not using Redis:**
```env
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### 4.4 JWT Authentication
```env
JWT_SECRET=your-random-secret-key-here-min-32-characters
```
**Generate a random string (at least 32 characters)**

### 4.5 Meta/Facebook Integration
```env
META_APP_ID=851090237886043
META_APP_SECRET=2e91c2844362b82180eb7ce0faefad08
META_VERIFY_TOKEN=your-webhook-verify-token
```

### 4.6 Stripe (If using payments)
```env
STRIPE_KEY=pk_live_your_stripe_key
STRIPE_SECRET=sk_live_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4.7 Deployment Control
```env
RUN_MIGRATIONS=true
```
**Set to `true` for first deployment, then `false` for subsequent deployments**

### 4.8 Frontend API URL (If needed)
```env
VITE_API_URL=https://your-domain.com/api
```

---

## 🔌 STEP 5: Port Configuration

### 5.1 Container Port
- **Container Port**: `80`
- This is the port your application listens on inside the container

### 5.2 Public Port
- Dokploy will automatically assign a public port
- Or configure domain/SSL in Dokploy's domain settings

---

## 🔄 STEP 6: Deployment Settings

### 6.1 Autodeploy
- **Autodeploy**: **ON** (toggle switch enabled)
- Automatically deploys when you push to the selected branch

### 6.2 Clean Cache
- **Clean Cache**: **OFF** (for first deployment)
- Turn **ON** if you want to clear Docker build cache on each deploy

### 6.3 Health Check
- Dokploy should automatically detect the health check from Dockerfile
- Health check endpoint: `/health` or `/api/health`

---

## 💾 STEP 7: Storage/Volumes (If Available)

If Dokploy has volume/storage settings:

### 7.1 Persistent Storage
- **Storage Path**: `/var/www/html/storage`
- This ensures Laravel storage persists between deployments

### 7.2 Bootstrap Cache
- **Cache Path**: `/var/www/html/bootstrap/cache`

---

## 🚀 STEP 8: Deploy the Application

### 8.1 First Deployment
1. **Review all settings** above
2. Click **"Deploy"** button (top right)
3. **Watch the build logs** - this will show:
   - Git clone progress
   - Docker build steps
   - Any errors

### 8.2 What Happens During Build
```
Step 1: Cloning repository...
Step 2: Building frontend (npm install, npm run build)
Step 3: Setting up backend (composer install)
Step 4: Copying files and configurations
Step 5: Creating final production image
Step 6: Starting container
```

### 8.3 Expected Build Time
- First build: **10-15 minutes** (downloads dependencies)
- Subsequent builds: **5-8 minutes** (with cache)

---

## ✅ STEP 9: Post-Deployment Setup

### 9.1 Generate Application Key
After first deployment, open **Terminal** in Dokploy and run:

```bash
php artisan key:generate
```

Copy the generated key and add it to Environment Variables:
```env
APP_KEY=base64:generated-key-here
```

### 9.2 Run Database Migrations
If `RUN_MIGRATIONS=false`, run manually:

```bash
php artisan migrate --force
```

### 9.3 Seed Database
```bash
php artisan db:seed
```

This creates:
- Admin user
- Billing plans
- Meta credentials

---

## 🔍 STEP 10: Verify Deployment

### 10.1 Check Application Status
- Go to **Applications** → Your app
- Status should show **"Running"** (green)

### 10.2 Check Logs
- Click **"Logs"** tab
- Should see: "🚀 Starting CRM SaaS Application..."
- Should see: "✅ Starting services with Supervisor..."

### 10.3 Test Endpoints
- **Frontend**: `https://your-domain.com`
- **API Health**: `https://your-domain.com/health`
- **API**: `https://your-domain.com/api`

---

## 🐛 Troubleshooting

### Error: "No such container: select-a-container"

**Causes:**
1. Container hasn't been created yet (first deployment)
2. Build failed before container creation
3. Dockerfile has errors

**Solutions:**
1. **Check Build Logs** - Look for errors in the build process
2. **Verify Files Exist** - Ensure all files are in Git:
   ```
   ✅ Dockerfile (root)
   ✅ docker/nginx.conf
   ✅ docker/supervisord.conf
   ✅ docker/start.sh
   ✅ frontend/ folder
   ✅ backend/ folder
   ```
3. **Test Dockerfile Locally**:
   ```bash
   docker build -t crm-test --target production .
   ```
4. **Check Docker Context** - Ensure "Docker Context Path" is `.`

### Error: "COPY failed: file not found"

**Cause:** Files not in Git repository

**Solution:**
```bash
git add Dockerfile docker/ frontend/ backend/
git commit -m "Add Docker configuration"
git push
```

### Error: "npm install failed"

**Cause:** Frontend dependencies issue

**Solution:**
- Check `frontend/package.json` exists
- Verify Node.js version (should be 20+)
- Check build logs for specific npm error

### Error: "composer install failed"

**Cause:** Backend dependencies issue

**Solution:**
- Check `backend/composer.json` exists
- Verify PHP version (should be 8.2+)
- Check build logs for specific composer error

### Error: "Database connection failed"

**Cause:** Wrong database credentials

**Solution:**
- Verify `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` in environment variables
- Test database connection from Dokploy terminal:
  ```bash
  php artisan tinker
  >>> DB::connection()->getPdo();
  ```

### Error: "Permission denied"

**Cause:** Storage permissions

**Solution:**
The startup script handles this, but if issues persist:
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## 📊 Complete Settings Summary

### Provider Section:
```
Source: Github
Repository: CRM
Branch: main
Build Path: Dockerfile
Trigger: On Push
Watch Paths: (empty)
Submodules: OFF
```

### Build Type Section:
```
Build Type: Dockerfile
Docker File: Dockerfile
Docker Context Path: .
Docker Build Stage: production
```

### Environment Variables (Minimum Required):
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=crm
DB_USERNAME=your-user
DB_PASSWORD=your-password
RUN_MIGRATIONS=true
```

### Ports:
```
Container Port: 80
```

### Deployment:
```
Autodeploy: ON
Clean Cache: OFF (first time)
```

---

## 🎯 Quick Checklist

Before clicking "Deploy", verify:

- [ ] All files committed to Git
- [ ] Dockerfile exists in root
- [ ] docker/ folder exists with all config files
- [ ] frontend/ folder exists
- [ ] backend/ folder exists
- [ ] Environment variables configured
- [ ] Database service available
- [ ] APP_URL matches your domain
- [ ] DB credentials are correct
- [ ] Docker Context Path is `.`
- [ ] Docker Build Stage is `production`

---

## 📞 Still Having Issues?

1. **Check Build Logs** - Most errors show here
2. **Check Runtime Logs** - After container starts
3. **Test Locally** - Build Docker image on your machine
4. **Verify Git** - Ensure all files are pushed
5. **Check Dokploy Docs** - For platform-specific issues

---

## 🔄 Updating Application

After initial deployment:

1. **Make code changes**
2. **Commit and push to Git**
3. **Dokploy auto-deploys** (if Autodeploy is ON)
4. **Or manually click "Deploy"**

---

*Last Updated: 2025-12-28*

