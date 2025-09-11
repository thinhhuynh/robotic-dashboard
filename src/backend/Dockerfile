# Simple, Working Backend Dockerfile
FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache wget curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including ts-node)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S weenapp && \
    adduser -S weenapp -u 1001 && \
    chown -R weenapp:weenapp /app

# Switch to non-root user
USER weenapp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]