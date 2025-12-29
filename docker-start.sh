#!/bin/bash
# Docker Quick Start Script for Linux/Mac
# This script helps you get started with Docker Compose

echo "🐳 CRM SaaS Docker Setup"
echo ""

# Check if Docker is running
echo "Checking Docker..."
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi

# Check if docker-compose is available
echo "Checking Docker Compose..."
if docker-compose --version > /dev/null 2>&1; then
    echo "✅ Docker Compose is available"
else
    echo "❌ Docker Compose is not available"
    exit 1
fi

echo ""
echo "Available commands:"
echo "  1. Development mode (with hot reload)"
echo "  2. Production mode"
echo "  3. Stop all services"
echo "  4. View logs"
echo "  5. Rebuild images"
echo "  6. Clean everything (⚠️ removes volumes)"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo "Starting in Development mode..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
        echo ""
        echo "✅ Services started!"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:8000"
        echo ""
        echo "View logs with: docker-compose logs -f"
        ;;
    2)
        echo "Starting in Production mode..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
        echo ""
        echo "✅ Services started!"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:8000"
        ;;
    3)
        echo "Stopping all services..."
        docker-compose down
        echo "✅ Services stopped"
        ;;
    4)
        echo "Viewing logs (Press Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    5)
        echo "Rebuilding images..."
        docker-compose build --no-cache
        echo "✅ Images rebuilt"
        ;;
    6)
        read -p "⚠️  This will remove all containers, volumes, and data. Continue? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "Cleaning everything..."
            docker-compose down -v --rmi all
            echo "✅ Cleaned"
        else
            echo "Cancelled"
        fi
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

