#!/bin/bash
# wait-for-services.sh - Wait for multiple services to be ready

set -e

SERVICES="$@"
TIMEOUT=60

wait_for() {
  local host=$1
  local port=$2
  local service_name=$3
  
  echo "⏳ Waiting for $service_name at $host:$port..."
  
  for i in $(seq 1 $TIMEOUT); do
    if nc -z "$host" "$port" > /dev/null 2>&1; then
      echo "✅ $service_name is ready!"
      return 0
    fi
    
    if [ $i -eq $TIMEOUT ]; then
      echo "❌ Timeout waiting for $service_name"
      return 1
    fi
    
    echo "🔄 Waiting for $service_name... ($i/$TIMEOUT)"
    sleep 1
  done
}

# Parse and wait for each service
if [ "$#" -eq 0 ]; then
  echo "Usage: $0 SERVICE:HOST:PORT [SERVICE:HOST:PORT ...]"
  echo "Example: $0 mongodb:mongodb:27017 redis:redis:6379"
  exit 1
fi

echo "🚀 Waiting for services to be ready..."

for service in $SERVICES; do
  IFS=':' read -r name host port <<< "$service"
  wait_for "$host" "$port" "$name"
done

echo "✅ All services are ready!"