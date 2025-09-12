#!/bin/bash

# Docker Compose Orchestrated Startup Script
echo "🚀 Starting Robotic Dashboard with Orchestrated Service Dependencies..."

cd /Users/thinhhd/working/WeenSpace/robotic-dashboard

# Function to check service health
check_service_health() {
  local service=$1
  local max_attempts=30
  local attempt=1
  
  echo "🩺 Checking $service health..."
  
  while [ $attempt -le $max_attempts ]; do
    if docker compose ps $service | grep -q "healthy"; then
      echo "✅ $service is healthy!"
      return 0
    fi
    
    echo "🔄 Attempt $attempt/$max_attempts: Waiting for $service to be healthy..."
    sleep 5
    attempt=$((attempt + 1))
  done
  
  echo "❌ $service failed to become healthy"
  return 1
}

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker compose down -v

# Step 1: Start MongoDB and wait for it to be healthy
echo "📊 Step 1: Starting MongoDB..."
docker compose up -d mongodb

if check_service_health "mongodb"; then
  echo "✅ MongoDB is ready"
else
  echo "❌ MongoDB failed to start"
  exit 1
fi

# Step 2: Start Redis and wait for it to be healthy
echo "🔄 Step 2: Starting Redis..."
docker compose up -d redis

if check_service_health "redis"; then
  echo "✅ Redis is ready"
else
  echo "❌ Redis failed to start"
  exit 1
fi

# Step 3: Start Backend and wait for it to be healthy
echo "🔧 Step 3: Starting Backend..."
docker compose up -d backend

if check_service_health "backend"; then
  echo "✅ Backend is ready"
else
  echo "❌ Backend failed to start"
  echo "📋 Backend logs:"
  docker compose logs backend
  exit 1
fi

# Step 4: Start Frontend
echo "🖥️  Step 4: Starting Frontend..."
docker compose up -d frontend

if check_service_health "frontend"; then
  echo "✅ Frontend is ready"
else
  echo "❌ Frontend failed to start"
  echo "📋 Frontend logs:"
  docker compose logs frontend
  exit 1
fi

# Final status check
echo ""
echo "🎉 All services are running!"
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🔗 Service URLs:"
echo "  🔧 Backend API: http://localhost:8080"
echo "  🔧 Backend Health: http://localhost:8080/health" 
echo "  📖 API Documentation: http://localhost:8080/api/v1/docs"
echo "  🔌 WebSocket Test: http://localhost:8080/websocket/test"
echo "  🖥️  Frontend: http://localhost:3000"
echo "  📱 Dashboard: http://localhost:3000/dashboard"

echo ""
echo "📋 Useful Commands:"
echo "  📊 Check status: docker compose ps"
echo "  📝 View logs: docker compose logs -f [service_name]"
echo "  🛑 Stop all: docker compose down"
echo "  🔄 Restart service: docker compose restart [service_name]"

echo ""
echo "✨ All services are ready! You can now use the application."