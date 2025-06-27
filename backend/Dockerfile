# syntax=docker/dockerfile:1.7

##############################
# Stage 0 — Dependencies    #
##############################
FROM composer:2.7 AS deps

WORKDIR /app

# Copy dependency files for better layer caching
COPY composer.json composer.lock ./

# Install dependencies with caching
RUN --mount=type=cache,target=/root/.composer \
    composer install --prefer-dist --no-interaction --no-progress \
        --no-scripts --no-dev --classmap-authoritative

#################################
# Development stage
#################################
FROM php:8.3-apache AS development

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip xml simplexml \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers

# Configure Apache virtual host with proper DocumentRoot
RUN echo '<VirtualHost *:80>\n\
    ServerName localhost\n\
    DocumentRoot /var/www/html/public\n\
    \n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        DirectoryIndex index.php\n\
        \n\
        <IfModule mod_rewrite.c>\n\
            RewriteEngine On\n\
            RewriteCond %{REQUEST_FILENAME} !-f\n\
            RewriteRule ^(.*)$ index.php [QSA,L]\n\
        </IfModule>\n\
    </Directory>\n\
    \n\
    Header always set Access-Control-Allow-Origin "*"\n\
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"\n\
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"\n\
    Header always set Access-Control-Allow-Credentials "true"\n\
    \n\
    RewriteEngine On\n\
    RewriteCond %{REQUEST_METHOD} OPTIONS\n\
    RewriteRule ^(.*)$ $1 [R=200,L]\n\
    \n\
    ErrorLog /var/log/apache2/error.log\n\
    CustomLog /var/log/apache2/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Create necessary directories with proper permissions
RUN mkdir -p var/cache var/log var/sessions public/images/user \
    && chown -R www-data:www-data var public/images \
    && chmod -R 775 var public/images

# Copy application code (will be overridden by volume mount in dev)
COPY --chown=www-data:www-data . ./

# Switch to non-root user
USER www-data

EXPOSE 80

CMD ["apache2-foreground"]

#################################
# Production stage
#################################
FROM development AS production

# Copy vendor from deps stage
COPY --from=deps --chown=www-data:www-data /app/vendor ./vendor

# Warm up Symfony cache
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && php bin/console cache:clear --env=prod || true

CMD ["apache2-foreground"]