# Robot Fleet Backend - NestJS

## UUID Robot IDs

The system now uses UUID v4 for robot IDs instead of simple strings. This provides:
- **Uniqueness**: Guaranteed unique IDs across distributed systems
- **Security**: Non-predictable IDs prevent enumeration attacks
- **Scalability**: No central ID generation needed

### Robot ID Generation
- **Automatic**: If no `robotId` is provided in the request, a UUID will be generated
- **Manual**: You can provide a UUID in the `robotId` field
- **Validation**: All robot IDs are validated as proper UUIDs

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

# Seed database with 200 robot records
npm run seed

# Seed with historical data (5,600 records over 7 days)
npm run seed:advanced

# Clean database
npm run db:clean

# Reset database (clean + seed)
npm run db:reset

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Database Seeding

The application includes several seeding options:

- **Basic Seeding** (`npm run seed`): Creates 200 robot records with current timestamps
- **Advanced Seeding** (`npm run seed:advanced`): Creates 200 robots with 7 days of historical data (5,600 total records)
- **Database Reset** (`npm run db:reset`): Cleans and re-seeds the database

### Seeding Features:
- **Realistic Data**: Battery levels, temperatures, and statuses follow realistic patterns
- **Error Simulation**: ~15% of robots have random error conditions
- **Charging Cycles**: Robots have realistic charging patterns
- **Location Data**: Random GPS coordinates and heights
- **Batch Processing**: Efficient batch insertion to prevent database overload