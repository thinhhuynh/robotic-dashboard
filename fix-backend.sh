#!/bin/bash

# Fix Backend Docker Issues
echo "🔧 Fixing Backend Docker Issues..."

cd /Users/thinhhd/working/WeenSpace/robotic-dashboard/src/backend

# Check if package-lock.json exists
if [ ! -f "package-lock.json" ]; then
    echo "📦 Creating package-lock.json..."
    npm install
fi

# Verify package.json has correct scripts
echo ""
echo "📋 Checking package.json scripts:"
cat package.json | grep -A 10 '"scripts":'

# Check if dist directory exists (should be created during build)
echo ""
echo "📁 Current backend directory:"
ls -la

# Clean any existing node_modules
echo ""
echo "🧹 Cleaning node_modules..."
rm -rf node_modules package-lock.json

# Fresh install
echo "📦 Fresh npm install..."
npm install

echo ""
echo "🔨 Testing local build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    echo "📁 Dist directory:"
    ls -la dist/
else
    echo "❌ Local build failed!"
    exit 1
fi

echo ""
echo "🎯 Ready for Docker build. Run:"
echo "   chmod +x /Users/thinhhd/working/WeenSpace/robotic-dashboard/test-backend-docker.sh"
echo "   /Users/thinhhd/working/WeenSpace/robotic-dashboard/test-backend-docker.sh"