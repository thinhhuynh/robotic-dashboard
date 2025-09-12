#!/bin/bash

# Test the fixed Docker build without mongosh
echo "🧪 Testing Fixed Docker Build (No mongosh)..."

cd /Users/thinhhd/working/WeenSpace/robotic-dashboard

# Clean up
echo "🧹 Cleaning up..."
docker compose down -v
docker system prune -f

# Test backend build first
echo "🔨 Testing backend Docker build..."
docker build --no-cache -t test-backend-fixed src/backend/

if [ $? -eq 0 ]; then
    echo "✅ Backend Docker build successful!"
    
    # Test the container
    echo "🧪 Testing container startup..."
    docker run --rm -d --name test-backend-fixed-container \
        -p 8081:8080 \
        -e NODE_ENV=production \
        -e PORT=8080 \
        -e SEED_ON_START=false \
        test-backend-fixed

    # Wait for startup
    sleep 10
    
    # Test health endpoint
    echo "🩺 Testing health endpoint..."
    if curl -f http://localhost:8081/health 2>/dev/null; then
        echo "✅ Health check passed!"
        echo "🎉 Docker build fix successful!"
    else
        echo "❌ Health check failed"
        echo "📋 Container logs:"
        docker logs test-backend-fixed-container
    fi
    
    # Cleanup
    docker stop test-backend-fixed-container
    docker rmi test-backend-fixed
    
else
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
echo "🚀 Build is working! Now test full stack:"
echo "   docker compose up --build"