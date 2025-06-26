FROM php:8.2-apache

# Installer dépendances système
RUN apt-get update && apt-get install -y \
    git unzip zip curl libzip-dev libicu-dev libonig-dev libxml2-dev \
    libpng-dev libjpeg-dev libfreetype6-dev libmariadb-dev \
    && docker-php-ext-install pdo pdo_mysql intl zip

# Activer mod_rewrite pour Symfony
RUN a2enmod rewrite

# Copier Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définir le dossier de travail
WORKDIR /var/www/html

# Copier le projet Symfony dans le conteneur
COPY . .

# Installer les dépendances PHP (Composer)
RUN composer install --no-interaction --no-progress --prefer-dist

# Configurer Apache pour servir le dossier public/
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf \
 && printf "\n<Directory /var/www/html/public>\n  AllowOverride All\n  Require all granted\n</Directory>\n" >> /etc/apache2/apache2.conf

# Fixer les permissions pour Symfony
RUN chown -R www-data:www-data /var/www/html/var /var/www/html/vendor /var/www/html/public \
 && chmod -R 775 /var/www/html/var /var/www/html/vendor

EXPOSE 80

CMD ["apache2-foreground"]
