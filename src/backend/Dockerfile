# Backend Dockerfile - NestJS with Node.js 22
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (for better Docker caching)
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install wget for health checks and create user in one layer
RUN apk add --no-cache wget && \
    addgroup -g 1001 -S weenapp && \
    adduser -S weenapp -u 1001

# Copy package files from builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership of the app directory
RUN chown -R weenapp:weenapp /app

# Switch to non-root user
USER weenapp

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]