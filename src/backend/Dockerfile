# Backend Dockerfile
FROM node:22-alpine

# Install build dependencies for uWebSockets.js
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn

# Copy application code
COPY . .

# Build the NestJS application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S weenapp && \
    adduser -S weenapp -u 1001

# Change ownership
RUN chown -R weenapp:weenapp /app

USER weenapp

EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start:prod"]