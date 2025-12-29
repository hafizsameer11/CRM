# 🐳 Docker Setup Guide for CRM SaaS

Complete guide for running the CRM SaaS application using Docker and Docker Compose.

---

## 📋 Prerequisites

- **Docker** 20.10+ installed
- **Docker Compose** 2.0+ installed
- At least **4GB RAM** available
- At least **10GB disk space**

---

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd CRM

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env  # If exists
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
# Application
APP_NAME="CRM SaaS"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=crm
DB_USERNAME=root
DB_PASSWORD=password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# JWT
JWT_SECRET=

# Stripe (Optional)
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

# Meta/Facebook (Required for social media features)
META_APP_ID=851090237886043
META_APP_SECRET=2e91c2844362b82180eb7ce0faefad08
META_VERIFY_TOKEN=

# WhatsApp (Optional)
WHATSAPP_PHONE_ID=
WHATSAPP_BUSINESS_ID=
WHATSAPP_VERIFY_TOKEN=
```

Edit `frontend/.env` (if exists, or create):

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Generate Application Keys

```bash
# Generate Laravel app key
cd backend
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret
```

Or let Docker handle it automatically on first run.

### 4. Start Services

#### Development Mode

```bash
# Start all services (development)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Start specific services
docker-compose up -d mysql redis backend frontend-dev
```

#### Production Mode

```bash
# Build and start (production)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# View logs
docker-compose logs -f
```

### 5. Run Migrations and Seeders

```bash
# Run migrations
docker-compose exec backend php artisan migrate

# Seed database (creates admin user, plans, etc.)
docker-compose exec backend php artisan db:seed

# Or run migrations automatically on startup (set in docker-compose.yml)
# Set RUN_MIGRATIONS=true in environment
```

---

## 📁 Project Structure

```
CRM/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── docker-entrypoint.sh
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── docker/
│       ├── nginx.conf
│       └── env.sh
├── docker-compose.yml          # Main compose file
├── docker-compose.dev.yml      # Development overrides
├── docker-compose.prod.yml     # Production overrides
└── .dockerignore
```

---

## 🔧 Services Overview

### **MySQL Database** (`mysql`)
- **Port**: 3306
- **Data**: Persisted in `mysql_data` volume
- **Health Check**: Enabled

### **Redis** (`redis`)
- **Port**: 6379
- **Data**: Persisted in `redis_data` volume
- **Used for**: Cache, sessions, queues
- **Health Check**: Enabled

### **Backend API** (`backend`)
- **Port**: 8000
- **Technology**: Laravel 12, PHP 8.2
- **Health Check**: Enabled
- **Dependencies**: MySQL, Redis

### **Queue Worker** (`queue`)
- Processes background jobs
- **Dependencies**: Backend, MySQL, Redis

### **Horizon Dashboard** (`horizon`)
- Queue monitoring dashboard
- Access at: `http://localhost:8000/horizon` (if routes configured)
- **Dependencies**: Backend, MySQL, Redis

### **Frontend** (`frontend` or `frontend-dev`)
- **Development Port**: 5173 (Vite dev server)
- **Production Port**: 80 (Nginx)
- **Technology**: React 18, TypeScript, Vite
- **Dependencies**: Backend

---

## 🛠️ Common Commands

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache
```

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Restart specific service
docker-compose restart backend
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Execute Commands

```bash
# Run Artisan commands
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed
docker-compose exec backend php artisan cache:clear

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Run npm commands (development)
docker-compose exec frontend-dev npm install
docker-compose exec frontend-dev npm run build
```

### Database Access

```bash
# MySQL CLI
docker-compose exec mysql mysql -u root -p

# Redis CLI
docker-compose exec redis redis-cli

# Run migrations
docker-compose exec backend php artisan migrate

# Seed database
docker-compose exec backend php artisan db:seed
```

---

## 🌍 Environment Configuration

### Development

Use `docker-compose.dev.yml`:
- Hot reload enabled
- Source code mounted as volumes
- Development dependencies included
- Debug mode enabled

### Production

Use `docker-compose.prod.yml`:
- Optimized builds
- No source code mounts
- Production dependencies only
- Debug mode disabled
- Nginx serving frontend

---

## 🔍 Troubleshooting

### Port Already in Use

If ports are already in use, change them in `docker-compose.yml`:

```yaml
ports:
  - "3307:3306"  # MySQL (changed from 3306)
  - "8001:8000"  # Backend (changed from 8000)
  - "3001:3000"  # Frontend (changed from 3000)
```

### Database Connection Issues

```bash
# Check MySQL is running
docker-compose ps mysql

# Check logs
docker-compose logs mysql

# Test connection from backend
docker-compose exec backend php artisan tinker
>>> DB::connection()->getPdo();
```

### Permission Issues

```bash
# Fix storage permissions
docker-compose exec backend chmod -R 775 storage bootstrap/cache
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Clear Caches

```bash
# Clear all Laravel caches
docker-compose exec backend php artisan optimize:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan route:clear
docker-compose exec backend php artisan view:clear
```

### Rebuild Everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Health Checks

All services have health checks configured:

```bash
# Check service health
docker-compose ps

# View health check status
docker inspect crm-backend | grep -A 10 Health
```

---

## 🔐 Security Notes

1. **Never commit `.env` files** - They contain secrets
2. **Change default passwords** - Update MySQL root password
3. **Use secrets management** - For production, use Docker secrets or external vault
4. **Enable HTTPS** - Use reverse proxy (nginx/traefik) in production
5. **Limit network exposure** - Only expose necessary ports

---

## 🚀 Production Deployment

### 1. Prepare Environment

```bash
# Set production environment variables
export APP_ENV=production
export APP_DEBUG=false
export DB_PASSWORD=<strong-password>
export JWT_SECRET=<generate-strong-secret>
```

### 2. Build Production Images

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### 3. Start Services

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Run Migrations

```bash
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan db:seed --force
```

### 5. Setup Reverse Proxy (Optional)

Use nginx or traefik as reverse proxy for:
- HTTPS/SSL termination
- Domain routing
- Load balancing

---

## 📝 Dockerfile Details

### Backend Dockerfile
- **Base**: PHP 8.2 FPM Alpine
- **Multi-stage**: Development and Production targets
- **Extensions**: MySQL, Redis, GD, Zip, etc.
- **Composer**: Latest version
- **Entrypoint**: Custom script for migrations, cache, etc.

### Frontend Dockerfile
- **Base**: Node 20 Alpine
- **Multi-stage**: Development (Vite) and Production (Nginx)
- **Build**: TypeScript compilation and asset optimization
- **Production**: Nginx serving static files

---

## 🎯 Next Steps

1. ✅ Configure environment variables
2. ✅ Start services
3. ✅ Run migrations
4. ✅ Seed database
5. ✅ Access application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Health Check: http://localhost:8000/api/health

---

## 📚 Additional Resources

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Laravel Docker**: https://laravel.com/docs/deployment
- **React Docker**: https://reactjs.org/docs/deployment.html

---

*Last Updated: 2025-12-25*

