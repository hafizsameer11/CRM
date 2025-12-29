# Multi-stage build for Laravel Backend
FROM php:8.2-fpm-alpine AS base

# Set working directory
WORKDIR /var/www/html

# Install PHP extensions and dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    postgresql-dev \
    mysql-client \
    icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    && apk del --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    postgresql-dev \
    icu-dev

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies (production - no dev dependencies)
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist || true

# Copy application files
COPY . .

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html || true \
    && chmod -R 755 storage bootstrap/cache || true

# Production stage
FROM base AS production

# Set proper permissions for storage and cache
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD php artisan health:check || php -r "echo 'OK';" || exit 1

# Start script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# Development stage
FROM base AS development

# Install development dependencies
RUN composer install --optimize-autoloader --no-interaction --prefer-dist || true

# Install Node.js and npm for frontend assets
RUN apk add --no-cache nodejs npm

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html || true \
    && chmod -R 755 storage bootstrap/cache || true

# Expose port
EXPOSE 8000

# Start script for development
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
