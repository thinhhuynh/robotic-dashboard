# Backend Dockerfile
FROM node:22-alpine

# Install build dependencies for uWebSockets.js
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# RUN npm ci --only=production
RUN npm i

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S weenapp && \
    adduser -S weenapp -u 1001

# Change ownership
RUN chown -R weenapp:weenapp /app

USER weenapp

EXPOSE 9001

CMD ["node", "app.js"]