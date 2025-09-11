#!/bin/bash

# Quick fix script for Next.js errors
echo "🔧 Fixing Next.js syntax errors..."

# Navigate to frontend directory
cd /Users/thinhhd/working/WeenSpace/robotic-dashboard/src/frontend

# Install socket.io-client
echo "📦 Installing socket.io-client..."
npm install socket.io-client@^4.8.1

# Clean up node modules and reinstall if needed
echo "🧹 Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
echo "🗑️ Clearing Next.js cache..."
rm -rf .next

echo "✅ Setup complete! Try running 'npm run dev' now."
echo ""
echo "🎯 Common fixes applied:"
echo "   - Added socket.io-client dependency"
echo "   - Cleaned node_modules"
echo "   - Cleared Next.js cache"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Check browser console for any remaining errors"
echo "   3. Test WebSocket connection in robot detail page"