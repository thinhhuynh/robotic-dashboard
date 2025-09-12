#!/bin/bash

# Test Docker Backend with Advanced Seeding
echo "🧪 Testing Docker Backend with Advanced Seeding..."

cd /Users/thinhhd/working/WeenSpace/robotic-dashboard

# Clean up first
echo "🧹 Cleaning up..."
docker compose down -v
docker system prune -f

# Check if backend files exist
echo "📁 Checking backend files..."
if [ ! -f "src/backend/package.json" ]; then
    echo "❌ Backend package.json missing!"
    exit 1
fi

if [ ! -f "src/backend/docker-entrypoint.sh" ]; then
    echo "❌ Docker entrypoint script missing!"
    exit 1
fi

# Build and start services
echo "🔨 Building and starting services..."
docker compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start (60s)..."
sleep 60

# Check backend health
echo "🩺 Checking backend health..."
if curl -f http://localhost:8080/health 2>/dev/null; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend health check failed"
    echo "📋 Backend logs:"
    docker compose logs backend
    exit 1
fi

# Check if seeding worked
echo "📊 Checking if database was seeded..."
ROBOT_COUNT=$(curl -s http://localhost:8080/robots | jq '.total' 2>/dev/null || echo "0")

if [ "$ROBOT_COUNT" -gt "0" ]; then
    echo "✅ Database seeding successful! Found $ROBOT_COUNT robots"
    
    # Test WebSocket endpoints
    echo "🔌 Testing WebSocket endpoints..."
    
    # Test dashboard WebSocket
    if curl -s http://localhost:8080/websocket/test > /dev/null; then
        echo "✅ WebSocket test endpoint working"
    else
        echo "❌ WebSocket test endpoint failed"
    fi
    
else
    echo "❌ Database seeding failed or no robots found"
    echo "📋 Backend logs:"
    docker compose logs backend
fi

# Show service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🔗 Service URLs:"
echo "  Backend API: http://localhost:8080"
echo "  Frontend: http://localhost:3000"
echo "  API Docs: http://localhost:8080/api/docs"

echo ""
echo "To stop services: docker compose down"
echo "To view logs: docker compose logs -f [service_name]"