# syntax=docker/dockerfile:1.7

##############################
# Stage 0 — build + vendor   #
##############################
FROM composer:2.7 AS build

WORKDIR /app

# 1️⃣  On ne copie que la définition des dépendances
COPY composer.json composer.lock ./

# 2️⃣  Cache BuildKit pour accélérer les installs
RUN --mount=type=cache,target=/root/.composer \
    composer install --prefer-dist --no-interaction --no-progress \
        --no-scripts --classmap-authoritative

# 3️⃣  On copie tout le code SAUF vendor (voir .dockerignore)
COPY . .

#################################
# Stage 1 — Runtime (Apache-PHP) #
#################################
FROM php:8.3-apache

# … mêmes RUN apt-get, extensions PHP, vhost, etc.

WORKDIR /var/www/html

# 4️⃣  On recopie d’un coup tout ce que le stage build a produit
#     (code + vendor déjà installé) ► pas de risque d’écrasement
COPY --from=build --chown=www-data:www-data /app ./

# 5️⃣  Répertoires écriture + user non-root
RUN mkdir -p var/cache var/log public/images && \
    chown -R www-data:www-data var public/images
USER www-data
