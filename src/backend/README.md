# Robot Fleet Backend - NestJS

## MongoDB Authentication Error Fix

If you're getting "Command aggregate requires authentication" error, follow these steps:

### Option 1: Use MongoDB without authentication (Development)
1. Start MongoDB without authentication:
   ```bash
   mongod --noauth
   ```

2. Or update your `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/robot-dashboard
   ```

### Option 2: Configure MongoDB with authentication
1. Update your `.env` file with credentials:
   ```env
   MONGODB_URI=mongodb://localhost:27017/robot-dashboard
   MONGODB_USERNAME=your_username
   MONGODB_PASSWORD=your_password
   MONGODB_AUTH_SOURCE=admin
   ```

2. Or use connection string with credentials:
   ```env
   MONGODB_URI=mongodb://username:password@localhost:27017/robot-dashboard?authSource=admin
   ```

### Option 3: Use MongoDB Atlas (Cloud)
Update your `.env` file:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/robot-dashboard?retryWrites=true&w=majority
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your MongoDB configuration

4. Start the application:
   ```bash
   npm run start:dev
   ```

5. Test the connection:
   ```bash
   curl http://localhost:8080/health/db
   ```

## Health Check Endpoints

- `GET /health` - General health check
- `GET /health/db` - Database connection status

## Development

```bash
# Start in development mode
npm run start:dev

# Start robot simulator
npm run simulator

# Build for production
npm run build

# Start production server
npm run start:prod
```