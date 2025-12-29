# Dokploy Deployment Configuration

## Current Settings (Based on Your Screenshot):

### Provider Section:
- **Source Code**: GitHub ✓
- **Github Account**: `Dokploy-2025-12-14-rqm003` ✓
- **Repository**: `CRM` ✓
- **Branch**: `main` ✓
- **Build Path**: `Dockerfile` ✓
- **Trigger Type**: `On Push` ✓
- **Watch Paths**: (empty - optional)
- **Enable Submodules**: OFF ✓

### Build Type Section:
- **Build Type**: `Dockerfile` ✓
- **Docker File**: `Dockerfile` ✓
- **Docker Context Path**: `.` ✓ (root directory)
- **Docker Build Stage**: `production` ✓

## ✅ All Settings Are Correct!

Your configuration matches the project structure perfectly.

## If You Get "No such container" Error:

This error usually means:
1. **First deployment** - The container hasn't been created yet. Click "Deploy" to create it.
2. **Build failed** - Check the build logs in Dokploy
3. **Missing files** - Ensure all files are committed to Git

## Required Files in Repository:

Make sure these files exist in your Git repository root:
- ✅ `Dockerfile` (root)
- ✅ `docker/nginx.conf`
- ✅ `docker/supervisord.conf`
- ✅ `docker/start.sh`
- ✅ `frontend/` folder
- ✅ `backend/` folder

## Next Steps:

1. **Save the settings** in Dokploy
2. **Add Environment Variables** (see below)
3. **Click "Deploy"** button
4. **Monitor build logs** for any errors

## Environment Variables to Add:

Go to your application → Environment Variables and add:

```env
APP_NAME=CRM SaaS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=crm
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

REDIS_HOST=your-redis-host
REDIS_PORT=6379
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

JWT_SECRET=your-jwt-secret-here

META_APP_ID=851090237886043
META_APP_SECRET=2e91c2844362b82180eb7ce0faefad08

RUN_MIGRATIONS=true
```

## Port Configuration:

- **Container Port**: `80`
- Dokploy will handle public port automatically

## After First Deploy:

1. Generate APP_KEY:
   - Open terminal in Dokploy
   - Run: `php artisan key:generate`
   - Copy the key and add to environment variables

2. Run migrations (if not auto-run):
   - `php artisan migrate --force`

3. Seed database:
   - `php artisan db:seed`

