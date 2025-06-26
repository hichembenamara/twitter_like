FROM node:20

WORKDIR /app

# ── ①   Désactive totalement la recherche du binaire natif ──
ENV ROLLUP_NO_NATIVE=true

# ── ②   Installe les dépendances sans peer-deps bloquants ──
COPY package*.json ./
RUN npm install --legacy-peer-deps

# ── ③   Copie le reste du code ──
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
