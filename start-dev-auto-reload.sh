#!/bin/bash

# Development Auto-reload Startup Script
echo "🚀 Starting Robotic Dashboard Development Environment with Auto-reload..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker compose &> /dev/null; then
    print_error "docker compose is not available. Please install Docker Compose."
    exit 1
fi

# Make auto-reload script executable
chmod +x auto-reload.sh

print_header "Cleaning up existing containers..."
docker compose -f docker-compose.dev.yml down -v

print_header "Building development images..."
docker compose -f docker-compose.dev.yml build --no-cache

print_header "Starting services with auto-reload..."

# Start services in order
print_status "1. Starting MongoDB..."
docker compose -f docker-compose.dev.yml up -d mongodb

print_status "2. Starting Redis..."
docker compose -f docker-compose.dev.yml up -d redis

# Wait for databases to be healthy
print_status "Waiting for databases to be ready..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker compose -f docker-compose.dev.yml ps mongodb | grep -q "healthy" && \
       docker compose -f docker-compose.dev.yml ps redis | grep -q "healthy"; then
        print_status "✅ Databases are ready!"
        break
    fi
    
    echo -n "."
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    print_error "Databases failed to start within $timeout seconds"
    exit 1
fi

print_status "3. Starting Backend..."
docker compose -f docker-compose.dev.yml up -d backend

print_status "4. Waiting for Backend to be healthy..."
timeout=120
counter=0

while [ $counter -lt $timeout ]; do
    if docker compose -f docker-compose.dev.yml ps backend | grep -q "healthy"; then
        print_status "✅ Backend is ready!"
        break
    fi
    
    echo -n "."
    sleep 3
    counter=$((counter + 3))
done

if [ $counter -ge $timeout ]; then
    print_error "Backend failed to start within $timeout seconds"
    docker compose -f docker-compose.dev.yml logs backend
    exit 1
fi

print_status "5. Starting Frontend with auto-reload..."
docker compose -f docker-compose.dev.yml up -d frontend

print_status "6. Starting Auto-reload Monitor..."
docker compose -f docker-compose.dev.yml up -d auto-reload

print_status "Waiting for Frontend to be ready..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker compose -f docker-compose.dev.yml ps frontend | grep -q "healthy"; then
        print_status "✅ Frontend is ready!"
        break
    fi
    
    echo -n "."
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    print_warning "Frontend took longer than expected to start, but continuing..."
fi

echo ""
echo "🎉 =================================="
echo "🎉 Development Environment Ready!"
echo "🎉 =================================="
echo ""
echo "📊 Service URLs:"
echo "  🖥️  Frontend (Dev): http://localhost:3000"
echo "  🔧 Backend API: http://localhost:8080"
echo "  📖 API Docs: http://localhost:8080/api/v1/docs"
echo "  🩺 Health Check: http://localhost:8080/health"
echo ""
echo "🔄 Auto-reload Features:"
echo "  ✅ Frontend hot reload enabled"
echo "  ✅ Backend hot reload enabled"
echo "  ✅ Auto-restart on backend health changes"
echo ""
echo "📋 Useful Commands:"
echo "  📊 Check status: docker compose -f docker-compose.dev.yml ps"
echo "  📝 View logs: docker compose -f docker-compose.dev.yml logs -f [service]"
echo "  🔄 Restart service: docker compose -f docker-compose.dev.yml restart [service]"
echo "  🛑 Stop all: docker compose -f docker-compose.dev.yml down"
echo ""
echo "🔍 Monitoring:"
echo "  📊 Backend logs: docker compose -f docker-compose.dev.yml logs -f backend"
echo "  📊 Frontend logs: docker compose -f docker-compose.dev.yml logs -f frontend"
echo "  🔄 Auto-reload logs: docker compose -f docker-compose.dev.yml logs -f auto-reload"
echo ""

# Option to follow logs
read -p "Would you like to follow the logs? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Following logs... (Press Ctrl+C to stop)"
    docker compose -f docker-compose.dev.yml logs -f
fi