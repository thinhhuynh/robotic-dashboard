#!/bin/bash

# 🚀 Robotic Dashboard - Quick Start Script
# This script automatically sets up and starts both frontend and backend

echo "🚀 Starting Robotic Dashboard Setup..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the robotic-dashboard root directory"
    exit 1
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 22+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js version is $NODE_VERSION. Recommended: 22+"
fi

# Check if MongoDB is running (for development mode)
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ismaster')" --quiet &> /dev/null; then
        echo "✅ MongoDB is running"
        MONGODB_RUNNING=true
    else
        echo "⚠️  MongoDB is not running. Will use Docker mode instead."
        MONGODB_RUNNING=false
    fi
else
    echo "⚠️  MongoDB not found. Will use Docker mode."
    MONGODB_RUNNING=false
fi

# Ask user for preferred mode
echo ""
echo "📋 Setup Options:"
echo "1. Development Mode (requires MongoDB)"
echo "2. Docker Mode (all-in-one)"
echo "3. Docker Development (backend+db in Docker, frontend local)"

if [ "$MONGODB_RUNNING" = false ]; then
    echo "   (Option 1 unavailable - MongoDB not running)"
fi

read -p "Choose setup mode (1-3): " SETUP_MODE

case $SETUP_MODE in
    1)
        if [ "$MONGODB_RUNNING" = false ]; then
            echo "❌ Cannot use development mode without MongoDB"
            exit 1
        fi
        echo "🔧 Setting up Development Mode..."
        
        # Backend setup
        echo "📦 Setting up backend..."
        cd src/backend
        
        if [ ! -f "package.json" ]; then
            echo "❌ Backend package.json not found"
            exit 1
        fi
        
        npm install
        
        if [ ! -f ".env" ]; then
            cp .env.example .env 2>/dev/null || echo "NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/robot-dashboard
CORS_ORIGIN=http://localhost:3000" > .env
        fi
        
        echo "🌱 Seeding database..."
        npm run seed
        
        echo "🚀 Starting backend..."
        npm run start:dev &
        BACKEND_PID=$!
        
        # Frontend setup
        echo "📦 Setting up frontend..."
        cd ../frontend
        
        if [ ! -f "package.json" ]; then
            echo "❌ Frontend package.json not found"
            exit 1
        fi
        
        npm install
        npm install socket.io-client@^4.8.1
        
        echo "🚀 Starting frontend..."
        npm run dev &
        FRONTEND_PID=$!
        
        # Wait a bit and check services
        sleep 10
        
        echo ""
        echo "🧪 Checking services..."
        
        if curl -s http://localhost:8080/health > /dev/null; then
            echo "✅ Backend is running at http://localhost:8080"
        else
            echo "❌ Backend failed to start"
        fi
        
        if curl -s http://localhost:3000 > /dev/null; then
            echo "✅ Frontend is running at http://localhost:3000"
        else
            echo "❌ Frontend failed to start"
        fi
        
        echo ""
        echo "🎉 Development mode started!"
        echo "📱 Open your browser to: http://localhost:3000"
        echo "📖 API docs at: http://localhost:8080/api/docs"
        echo ""
        echo "Press Ctrl+C to stop all services"
        
        # Wait for user to stop
        trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT
        wait
        ;;
        
    2)
        echo "🐳 Setting up Docker Mode..."
        
        if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker or Docker Compose not found"
            exit 1
        fi
        
        echo "🧹 Cleaning up previous containers..."
        docker compose down -v 2>/dev/null
        
        echo "🔨 Building and starting all services..."
        docker compose up --build
        ;;
        
    3)
        echo "🔨 Setting up Docker Development Mode..."
        
        if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker or Docker Compose not found"
            exit 1
        fi
        
        echo "🧹 Cleaning up previous containers..."
        docker compose down -v 2>/dev/null
        
        echo "🐳 Starting backend and database in Docker..."
        docker compose up -d backend mongodb
        
        echo "⏳ Waiting for backend to be ready..."
        sleep 15
        
        # Setup frontend locally
        echo "📦 Setting up frontend locally..."
        cd src/frontend
        npm install
        npm install socket.io-client@^4.8.1
        
        echo "🚀 Starting frontend..."
        npm run dev &
        FRONTEND_PID=$!
        
        echo ""
        echo "🎉 Hybrid mode started!"
        echo "📱 Frontend (local): http://localhost:3000"
        echo "🔧 Backend (Docker): http://localhost:8080"
        echo ""
        echo "Press Ctrl+C to stop frontend (backend will keep running in Docker)"
        
        trap "echo ''; echo '🛑 Stopping frontend...'; kill $FRONTEND_PID 2>/dev/null; echo 'Backend still running in Docker. Use: docker compose down'; exit 0" SIGINT
        wait $FRONTEND_PID
        ;;
        
    *)
        echo "❌ Invalid option selected"
        exit 1
        ;;
esac