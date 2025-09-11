#!/bin/bash

# 🔧 Robotic Dashboard - Troubleshooting & Fix Script
echo "🔧 Robotic Dashboard Troubleshooting..."

# Check current directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the robotic-dashboard root directory"
    exit 1
fi

echo ""
echo "🔍 System Check:"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found - please install Node.js 22+"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker: $DOCKER_VERSION"
else
    echo "❌ Docker not found"
fi

# Check MongoDB
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ismaster')" --quiet &> /dev/null 2>&1; then
        echo "✅ MongoDB: Running"
    else
        echo "⚠️  MongoDB: Installed but not running"
    fi
else
    echo "⚠️  MongoDB: Not installed"
fi

echo ""
echo "🔍 Port Check:"

# Check if ports are in use
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
        local process=$(ps -p $pid -o comm= 2>/dev/null)
        echo "🔴 Port $port ($service): In use by PID $pid ($process)"
    else
        echo "✅ Port $port ($service): Available"
    fi
}

check_port 3000 "Frontend"
check_port 8080 "Backend"
check_port 27017 "MongoDB"

echo ""
echo "🔍 File Check:"

# Check backend files
if [ -f "src/backend/package.json" ]; then
    echo "✅ Backend package.json exists"
else
    echo "❌ Backend package.json missing"
fi

if [ -f "src/backend/.env" ]; then
    echo "✅ Backend .env exists"
else
    echo "⚠️  Backend .env missing (will be created)"
fi

if [ -d "src/backend/node_modules" ]; then
    echo "✅ Backend node_modules exists"
else
    echo "⚠️  Backend node_modules missing (run npm install)"
fi

# Check frontend files
if [ -f "src/frontend/package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "❌ Frontend package.json missing"
fi

if [ -d "src/frontend/node_modules" ]; then
    echo "✅ Frontend node_modules exists"
    if [ -d "src/frontend/node_modules/socket.io-client" ]; then
        echo "✅ socket.io-client installed"
    else
        echo "⚠️  socket.io-client missing"
    fi
else
    echo "⚠️  Frontend node_modules missing (run npm install)"
fi

echo ""
echo "🛠️  Quick Fixes:"

# Offer quick fix options
echo "1. Kill processes on ports 3000, 8080, 27017"
echo "2. Clean and reinstall all dependencies"
echo "3. Reset Docker containers"
echo "4. Full reset (everything)"
echo "5. Test services"
echo "6. Exit"

read -p "Choose fix option (1-6): " FIX_OPTION

case $FIX_OPTION in
    1)
        echo "🔪 Killing processes on ports..."
        sudo lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Killed port 3000" || echo "❌ No process on port 3000"
        sudo lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "✅ Killed port 8080" || echo "❌ No process on port 8080"
        sudo lsof -ti:27017 | xargs kill -9 2>/dev/null && echo "✅ Killed port 27017" || echo "❌ No process on port 27017"
        ;;
    2)
        echo "🧹 Cleaning and reinstalling dependencies..."
        rm -rf src/backend/node_modules src/frontend/node_modules
        rm -f src/backend/package-lock.json src/frontend/package-lock.json
        
        echo "📦 Installing backend dependencies..."
        cd src/backend && npm install
        
        echo "📦 Installing frontend dependencies..."
        cd ../frontend && npm install
        npm install socket.io-client@^4.8.1
        
        echo "✅ Dependencies reinstalled"
        ;;
    3)
        echo "🐳 Resetting Docker containers..."
        docker compose down -v
        docker system prune -f
        echo "✅ Docker reset complete"
        ;;
    4)
        echo "💥 Full reset (this will take a while)..."
        
        # Kill processes
        sudo lsof -ti:3000,8080,27017 | xargs kill -9 2>/dev/null
        
        # Docker cleanup
        docker compose down -v
        docker system prune -a -f
        
        # Node modules cleanup
        rm -rf src/backend/node_modules src/frontend/node_modules
        rm -f src/backend/package-lock.json src/frontend/package-lock.json
        
        # Fresh install
        cd src/backend && npm install
        cd ../frontend && npm install && npm install socket.io-client@^4.8.1
        
        echo "✅ Full reset complete"
        ;;
    5)
        echo "🧪 Testing services..."
        
        # Test backend
        if curl -s http://localhost:8080/health > /dev/null; then
            echo "✅ Backend is responding"
        else
            echo "❌ Backend not responding"
        fi
        
        # Test frontend
        if curl -s http://localhost:3000 > /dev/null; then
            echo "✅ Frontend is responding"
        else
            echo "❌ Frontend not responding"
        fi
        
        # Test WebSocket
        if curl -s http://localhost:8080/websocket/test > /dev/null; then
            echo "✅ WebSocket endpoint is responding"
        else
            echo "❌ WebSocket endpoint not responding"
        fi
        ;;
    6)
        echo "👋 Exiting troubleshooter"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎯 Next steps:"
echo "   1. Run: ./quick-start.sh"
echo "   2. Or manually start services:"
echo "      - Backend: cd src/backend && npm run start:dev"
echo "      - Frontend: cd src/frontend && npm run dev"
echo "   3. Or use Docker: docker compose up --build"