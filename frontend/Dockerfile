# --- Stage 1: Build React app ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first to maximize Docker layer cache
COPY package*.json ./
RUN npm ci

# Build static assets
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
