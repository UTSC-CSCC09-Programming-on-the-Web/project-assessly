# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.mts ./
COPY tsconfig*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build || npx vite build --mode production

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S frontend -u 1001 -G nginx

# Change ownership
RUN chown -R frontend:nginx /usr/share/nginx/html
RUN chown -R frontend:nginx /var/cache/nginx
RUN chown -R frontend:nginx /var/log/nginx
RUN chown -R frontend:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R frontend:nginx /var/run/nginx.pid

USER frontend

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
