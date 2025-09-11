#!/bin/bash

# Debug Docker Backend Build Issues
echo "🔍 Debugging Docker Backend Build..."

cd /Users/thinhhd/working/WeenSpace/robotic-dashboard

# Check if files exist in backend directory
echo ""
echo "📁 Checking backend directory structure:"
ls -la src/backend/

echo ""
echo "📄 Checking for package.json:"
if [ -f "src/backend/package.json" ]; then
    echo "✅ package.json exists"
    echo "📦 Package info:"
    head -10 src/backend/package.json
else
    echo "❌ package.json NOT found in src/backend/"
fi

echo ""
echo "🐳 Checking Docker context..."
echo "Current directory: $(pwd)"

# Check docker-compose.yml
echo ""
echo "📋 Docker compose backend service config:"
grep -A 20 "backend:" docker-compose.yml

# Clean up previous builds
echo ""
echo "🧹 Cleaning up Docker..."
docker compose down
docker system prune -f

# Build with verbose output
echo ""
echo "🔨 Building backend with verbose output..."
docker compose build --no-cache backend

echo ""
echo "🎯 If build succeeds, try running:"
echo "   docker compose up backend"