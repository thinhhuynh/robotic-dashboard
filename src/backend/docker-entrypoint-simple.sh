#!/bin/bash
set -e

# Enhanced Docker entrypoint script with robust service waiting
echo "🚀 Starting Robotic Dashboard Backend..."

# Function to wait for a service
wait_for_service() {
  local service=$1
  local host=$2
  local port=$3
  local max_attempts=60
  local attempt=1
  
  echo "⏳ Waiting for $service to be ready..."
  
  while [ $attempt -le $max_attempts ]; do
    if nc -z $host $port 2>/dev/null; then
      echo "✅ $service is ready!"
      return 0
    fi
    
    echo "🔄 Attempt $attempt/$max_attempts: Waiting for $service connection..."
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "❌ Failed to connect to $service after $max_attempts attempts"
  return 1
}

# Wait for MongoDB
wait_for_service "MongoDB" "mongodb" "27017"

# Wait for Redis  
wait_for_service "Redis" "redis" "6379"

# Additional wait to ensure services are fully initialized
echo "⏳ Waiting additional 10 seconds for services to fully initialize..."
sleep 10

# Test MongoDB connection with authentication
echo "🔐 Testing MongoDB authentication..."
MONGODB_TEST=$(node -e "
  const mongoose = require('mongoose');
  const mongoUri = process.env.MONGODB_URI;
  
  mongoose.connect(mongoUri, { 
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000 
  })
  .then(() => {
    console.log('✅ MongoDB authentication successful');
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ MongoDB authentication failed:', error.message);
    process.exit(1);
  });
" 2>&1)

if [ $? -ne 0 ]; then
  echo "❌ MongoDB connection test failed"
  echo "$MONGODB_TEST"
  echo "⚠️  Continuing anyway..."
  sleep 5
else
  echo "✅ MongoDB connection verified"
fi

# Check if we should seed the database
if [ "$SEED_ON_START" = "true" ]; then
  echo "🌱 Database seeding enabled..."
  
  # Wait a bit more for MongoDB to be fully ready
  sleep 5
  
  # Try to seed the database using the app's seeding functionality
  echo "📊 Running database seeding..."
  
  # Use Node.js to check database and seed if needed
  node -e "
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI;
    
    console.log('🔗 Connecting to MongoDB:', mongoUri);
    
    mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000 
    })
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      
      try {
        const robotCount = await mongoose.connection.db.collection('robots').countDocuments();
        console.log('📊 Current robot count:', robotCount);
        
        if (robotCount === 0) {
          console.log('🌱 Database is empty, needs seeding');
          process.exit(0); // Exit 0 means seed is needed
        } else {
          console.log('✅ Database already has data, skipping seeding');
          process.exit(1); // Exit 1 means no seeding needed
        }
      } catch (error) {
        console.log('⚠️  Could not check database, will seed anyway');
        process.exit(0);
      }
    })
    .catch(error => {
      console.log('❌ MongoDB connection failed:', error.message);
      console.log('⚠️  Will attempt seeding anyway');
      process.exit(0);
    });
  "
  
  # Check the exit code from the Node.js script
  if [ $? -eq 0 ]; then
    echo "🌱 Running npm run seed:advanced..."
    npm run seed:advanced || echo "⚠️  Seeding failed, continuing..."
  else
    echo "✅ Skipping seeding - database already has data"
  fi
else
  echo "ℹ️  Database seeding disabled (SEED_ON_START not set to 'true')"
fi

# Start the application
echo "🚀 Starting NestJS application..."
exec node dist/main.js