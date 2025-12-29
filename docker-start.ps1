# Docker Quick Start Script for Windows PowerShell
# This script helps you get started with Docker Compose

Write-Host "🐳 CRM SaaS Docker Setup" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  1. Development mode (with hot reload)"
Write-Host "  2. Production mode"
Write-Host "  3. Stop all services"
Write-Host "  4. View logs"
Write-Host "  5. Rebuild images"
Write-Host "  6. Clean everything (⚠️ removes volumes)"
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host "Starting in Development mode..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
        Write-Host ""
        Write-Host "✅ Services started!" -ForegroundColor Green
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "View logs with: docker-compose logs -f" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "Starting in Production mode..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
        Write-Host ""
        Write-Host "✅ Services started!" -ForegroundColor Green
        Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Services stopped" -ForegroundColor Green
    }
    "4" {
        Write-Host "Viewing logs (Press Ctrl+C to exit)..." -ForegroundColor Yellow
        docker-compose logs -f
    }
    "5" {
        Write-Host "Rebuilding images..." -ForegroundColor Yellow
        docker-compose build --no-cache
        Write-Host "✅ Images rebuilt" -ForegroundColor Green
    }
    "6" {
        $confirm = Read-Host "⚠️  This will remove all containers, volumes, and data. Continue? (yes/no)"
        if ($confirm -eq "yes") {
            Write-Host "Cleaning everything..." -ForegroundColor Yellow
            docker-compose down -v --rmi all
            Write-Host "✅ Cleaned" -ForegroundColor Green
        } else {
            Write-Host "Cancelled" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

