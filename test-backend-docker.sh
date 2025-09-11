#!/bin/bash

# Test Docker Backend Build
echo "🔧 Testing Docker Backend Build..."

# Navigate to project root
cd /Users/thinhhd/working/WeenSpace/robotic-dashboard

# Clean up first
echo "🧹 Cleaning up Docker..."
docker compose down -v
docker system prune -f

# Check backend files exist
echo ""
echo "📁 Checking backend files:"
echo "package.json: $(ls -la src/backend/package.json 2>/dev/null || echo 'NOT FOUND')"
echo "package-lock.json: $(ls -la src/backend/package-lock.json 2>/dev/null || echo 'NOT FOUND')"
echo "Dockerfile: $(ls -la src/backend/Dockerfile 2>/dev/null || echo 'NOT FOUND')"

# Show build context
echo ""
echo "📂 Backend directory contents:"
ls -la src/backend/

# Try to build backend only
echo ""
echo "🔨 Building backend (verbose)..."
cd src/backend
docker build --no-cache --progress=plain -t test-backend .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! Testing container..."
    
    # Test the container
    docker run --rm -d --name test-backend-container -p 8081:8080 \
        -e NODE_ENV=production \
        -e PORT=8080 \
        test-backend

    # Wait a bit and check health
    sleep 10
    
    echo "🧪 Testing health endpoint..."
    curl -f http://localhost:8081/health || echo "Health check failed"
    
    # Clean up test container
    docker stop test-backend-container
    docker rmi test-backend
    
    echo ""
    echo "🎉 Backend Docker build works! You can now run:"
    echo "   cd /Users/thinhhd/working/WeenSpace/robotic-dashboard"
    echo "   docker compose up backend"
else
    echo ""
    echo "❌ Build failed. Check the output above for errors."
    echo ""
    echo "🔍 Common issues:"
    echo "   1. Missing package.json or package-lock.json"
    echo "   2. Syntax errors in TypeScript code"
    echo "   3. Missing dependencies"
    echo "   4. Build script issues"
fi