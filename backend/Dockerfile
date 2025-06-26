FROM php:8.2-apache

# Installer les extensions PHP + dépendances nécessaires
RUN apt-get update && apt-get install -y \
    git unzip zip curl libzip-dev libicu-dev libonig-dev libxml2-dev \
    libpng-dev libjpeg-dev libfreetype6-dev libmariadb-dev \
    && docker-php-ext-install pdo pdo_mysql intl zip

# Activer mod_rewrite pour Apache (pour Symfony)
RUN a2enmod rewrite

# Définir le dossier de travail
WORKDIR /var/www/html

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copier le code Symfony dans le conteneur
COPY . .



# Fixer les permissions (facultatif)
RUN chown -R www-data:www-data var vendor

EXPOSE 80

# Lancer Apache
CMD ["apache2-foreground"]

# ── Configure Apache pour Symfony ──
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf \
 && printf "\n<Directory /var/www/html/public>\n  AllowOverride All\n  Require all granted\n</Directory>\n" >> /etc/apache2/apache2.conf
