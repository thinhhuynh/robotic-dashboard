#!/bin/bash
set -e

# Docker entrypoint script for robotic dashboard backend
echo "🚀 Starting Robotic Dashboard Backend..."

# Wait for MongoDB to be available
echo "⏳ Waiting for MongoDB to be ready..."
until mongosh --host mongodb --port 27017 --eval "db.adminCommand('ping')" --quiet; do
  echo "🔄 Waiting for MongoDB connection..."
  sleep 2
done

echo "✅ MongoDB is ready!"

# Check if we should seed the database
if [ "$SEED_ON_START" = "true" ]; then
  echo "🌱 Checking if database needs seeding..."
  
  # Check if robots collection exists and has data
  ROBOT_COUNT=$(mongosh --host mongodb --port 27017 --authenticationDatabase admin \
    -u admin -p ${MONGO_PASSWORD:-roboticDashboard123} \
    --eval "use('robotic-dashboard'); db.robots.countDocuments()" --quiet 2>/dev/null || echo "0")
  
  if [ "$ROBOT_COUNT" = "0" ] || [ -z "$ROBOT_COUNT" ]; then
    echo "📊 Database is empty, running advanced seeding..."
    npm run seed:advanced
    
    if [ $? -eq 0 ]; then
      echo "✅ Database seeding completed successfully!"
    else
      echo "⚠️  Database seeding failed, continuing anyway..."
    fi
  else
    echo "✅ Database already contains $ROBOT_COUNT robots, skipping seeding"
  fi
else
  echo "ℹ️  Seeding disabled (SEED_ON_START not set to 'true')"
fi

# Start the application
echo "🚀 Starting NestJS application..."
exec node dist/main.js