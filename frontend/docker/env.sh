#!/bin/sh
set -e

# Replace environment variables in built assets
# This script runs at container startup to inject runtime env vars

if [ -n "$VITE_API_URL" ]; then
    # Find and replace API URL in built JavaScript files
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000/api|${VITE_API_URL}|g" {} \;
    find /usr/share/nginx/html -type f -name "*.html" -exec sed -i "s|http://localhost:8000/api|${VITE_API_URL}|g" {} \;
fi

# Execute the main command (nginx)
exec "$@"
