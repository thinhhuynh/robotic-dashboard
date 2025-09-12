#!/bin/bash

# Auto-reload Docker Compose Script
# This script monitors backend health and restarts frontend when backend is ready

PROJECT_NAME="robotic-dashboard"
BACKEND_CONTAINER="${PROJECT_NAME}-backend"
FRONTEND_CONTAINER="${PROJECT_NAME}-frontend"

echo "🔄 Starting Auto-reload Monitor for Robotic Dashboard..."

# Function to check if container is healthy
check_container_health() {
    local container_name=$1
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null)
    echo $health_status
}

# Function to restart frontend container
restart_frontend() {
    echo "🔄 Restarting frontend container..."
    docker compose restart frontend
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend restarted successfully"
    else
        echo "❌ Failed to restart frontend"
    fi
}

# Function to wait for backend to be healthy
wait_for_backend() {
    echo "⏳ Waiting for backend to be healthy..."
    
    while true; do
        backend_health=$(check_container_health $BACKEND_CONTAINER)
        
        case $backend_health in
            "healthy")
                echo "✅ Backend is healthy!"
                return 0
                ;;
            "unhealthy")
                echo "❌ Backend is unhealthy, waiting..."
                ;;
            "starting")
                echo "🔄 Backend is starting..."
                ;;
            *)
                echo "❓ Backend status unknown: $backend_health"
                ;;
        esac
        
        sleep 5
    done
}

# Function to monitor backend changes
monitor_backend_changes() {
    echo "👀 Monitoring backend health changes..."
    
    local last_health=""
    
    while true; do
        current_health=$(check_container_health $BACKEND_CONTAINER)
        
        if [ "$current_health" != "$last_health" ]; then
            echo "🔄 Backend health changed: $last_health -> $current_health"
            
            if [ "$current_health" = "healthy" ] && [ "$last_health" != "healthy" ]; then
                echo "🎉 Backend became healthy! Restarting frontend..."
                restart_frontend
            fi
        fi
        
        last_health=$current_health
        sleep 10
    done
}

# Main execution
case "${1:-monitor}" in
    "wait")
        wait_for_backend
        restart_frontend
        ;;
    "monitor")
        wait_for_backend
        restart_frontend
        monitor_backend_changes
        ;;
    "restart")
        restart_frontend
        ;;
    *)
        echo "Usage: $0 [wait|monitor|restart]"
        echo "  wait    - Wait for backend to be healthy, then restart frontend once"
        echo "  monitor - Continuously monitor backend and restart frontend when healthy"
        echo "  restart - Restart frontend immediately"
        exit 1
        ;;
esac