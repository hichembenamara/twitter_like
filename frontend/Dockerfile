# Multi-stage build for optimized development and production
FROM node:20-alpine AS base

# Install pnpm for better performance (optional - you can use npm)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

#################################
# Development stage
#################################
FROM base AS development

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Development command (run as root for simplicity in dev mode)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

#################################
# Production build stage
#################################
FROM base AS build

# Set build-time environment variables
ARG VITE_API_URL=http://localhost:8001
ENV VITE_API_URL=$VITE_API_URL

# Copy source code
COPY . .

# Build the application
RUN npm run build

#################################
# Production stage
#################################
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Handle React Router (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy to backend (proxy to host machine since containers are separate)
    location /api/ {
        proxy_pass http://host.docker.internal:8001/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
        add_header Access-Control-Allow-Credentials true;
        
        # Handle preflight requests
        if (\$request_method = OPTIONS) {
            return 200;
        }
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]