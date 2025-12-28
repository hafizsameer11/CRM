# Start Laravel Server from CRM Backend Directory
# This ensures the correct routes are loaded

Write-Host "Starting Laravel server from CRM backend..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
Set-Location $PSScriptRoot

# Verify we're in the right directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Cyan

# Check if routes file exists
if (-not (Test-Path "routes/api.php")) {
    Write-Host "ERROR: routes/api.php not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the backend directory." -ForegroundColor Red
    exit 1
}

# Clear caches
Write-Host "Clearing caches..." -ForegroundColor Yellow
php artisan route:clear | Out-Null
php artisan config:clear | Out-Null
php artisan cache:clear | Out-Null

# Verify routes
Write-Host ""
Write-Host "Verifying routes..." -ForegroundColor Yellow
php artisan route:list --path=api/auth

Write-Host ""
Write-Host "Starting server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start the server
php artisan serve

