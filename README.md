# Robotic Dashboard

A comprehensive robot fleet management system built with **NestJS** backend and **Next.js** frontend, featuring real-time WebSocket communication, MongoDB storage, and Docker deployment.

## 📋 **Introduction**

This project demonstrates a modern, scalable architecture for IoT device management, specifically designed for robotic fleets. It showcases real-time communication, data persistence, and containerized deployment patterns commonly used in enterprise applications.

### **🎯 Key Features**

- **🤖 Real-time Robot Fleet Management** - Monitor and control multiple robots simultaneously
- **📊 Live Dashboard** - Interactive dashboard with real-time updates and statistics
- **🔌 WebSocket Communication** - Bidirectional communication for instant updates
- **📱 Responsive Web Interface** - Modern React-based frontend with Next.js
- **🗄️ MongoDB Integration** - Scalable document database for robot data
- **🐳 Docker Containerization** - Easy deployment and scaling
- **📖 API Documentation** - Comprehensive Swagger/OpenAPI documentation
- **🔐 UUID-based Security** - Non-predictable robot IDs for enhanced security

### **🏗️ Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)       │◄──►│   (MongoDB)     │
│                 │    │                  │    │                 │
│ • Dashboard     │    │ • REST API       │    │ • Robot Data    │
│ • Robot Control │    │ • WebSocket      │    │ • Historical    │
│ • Real-time UI  │    │ • Authentication │    │ • Logs          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **🚀 Technology Stack**

#### **Backend (NestJS)**
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **WebSockets**: Socket.IO for real-time communication
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator and class-transformer
- **Testing**: Jest for unit and integration tests

#### **Frontend (Next.js)**
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript for type safety
- **Styling**: CSS Modules and styled-components
- **WebSocket Client**: Socket.IO client
- **State Management**: React hooks and context

#### **Infrastructure**
- **Database**: MongoDB 8.0
- **Caching**: Redis (optional for scaling)
- **Containerization**: Docker and Docker Compose
- **Load Balancing**: Nginx (optional)
- **Monitoring**: Prometheus and Grafana (optional)

## 🚀 **How to Start Frontend and Backend**

### **⚡ Quick Start Script (Recommended)**

```bash
# Make the script executable and run it
chmod +x quick-start.sh
./quick-start.sh
```

The script will guide you through:
1. **Development Mode** - Local backend + frontend (requires MongoDB)
2. **Docker Mode** - Everything in containers
3. **Hybrid Mode** - Backend in Docker, frontend local

---

### **Option 1: Development Mode (Manual Setup)**

#### **🔧 Step 1: Start Backend**

```bash
# Open terminal and navigate to backend
cd path-to-project/robotic-dashboard/src/backend

# Install dependencies
npm install

# Create environment file (if not exists)
cp .env.example .env

# Edit .env file and set your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/robot-dashboard

# Seed database with sample robots
npm run seed

# Start backend in development mode
npm run start:dev
```

**✅ Backend running at:** `http://localhost:8080`

#### **🖥️ Step 2: Start Frontend**

```bash
# Open NEW terminal and navigate to frontend
cd /Users/thinhhd/working/WeenSpace/robotic-dashboard/src/frontend

# Install dependencies
npm install

# Install WebSocket client
npm install socket.io-client@^4.8.1

# Create frontend environment configuration
cp .env.example .env.local

# Start frontend in development mode
npm run dev
```

**✅ Frontend running at:** `http://localhost:3000`

#### **🧪 Step 3: Verify Everything Works**

1. **Backend Health**: <http://localhost:8080/health>
2. **API Documentation**: <http://localhost:8080/api/v1/docs>
3. **WebSocket Test**: <http://localhost:8080/websocket/test>
4. **Frontend Dashboard**: <http://localhost:3000/dashboard>

---

### **Option 2: Docker Mode (One Command Setup)**

```bash
# Navigate to project root
cd path-to-project/robotic-dashboard

# Start all services with Docker
docker compose up --build

# Or run in background
docker compose up -d --build
```

**Services will be available at:**
- **Frontend**: <http://localhost:3000>
- **Backend**: <http://localhost:8080>
- **MongoDB**: `localhost:27017`

---

### **Option 3: Production Mode**

#### **Backend Production**

```bash
cd src/backend

# Build for production
npm run build

# Start production server
npm run start:prod
```

#### **Frontend Production**

```bash
cd src/frontend

# Build for production
npm run build

# Start production server
npm run start
```

---

### **🔄 Complete Development Workflow**

#### **First Time Setup**

```bash
# 1. Clone repository
git clone <repository-url>
cd robotic-dashboard

# 2. Backend setup
cd src/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run seed
npm run start:dev

# 3. Frontend setup (in new terminal)
cd src/frontend
npm install
npm install socket.io-client@^4.8.1
cp .env.example .env.local
npm run dev

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api/v1/docs
```

#### **Daily Development**

```bash
# Terminal 1: Backend
cd src/backend
npm run start:dev

# Terminal 2: Frontend
cd src/frontend
npm run dev

# Terminal 3: Database operations (optional)
cd src/backend
npm run seed          # Reseed database
npm run db:clean      # Clean database
npm run simulator     # Start robot simulator
```

---

### **🐛 Quick Troubleshooting**

#### **Port Conflicts**

```bash
# Kill processes on ports
sudo lsof -ti:3000 | xargs kill -9  # Frontend
sudo lsof -ti:8080 | xargs kill -9  # Backend
sudo lsof -ti:27017 | xargs kill -9 # MongoDB
```

#### **Clean Restart**

```bash
# Stop all services
docker compose down -v

# Clean everything
rm -rf src/backend/node_modules src/frontend/node_modules
docker system prune -f

# Fresh install
cd src/backend && npm install
cd ../frontend && npm install

# Start development
cd src/backend && npm run start:dev &
cd src/frontend && npm run dev
```

#### **Check Services Status**

```bash
# Check backend
curl http://localhost:8080/health

# Check frontend
curl http://localhost:3000

# Check WebSocket
curl http://localhost:8080/websocket/test
```

---

## 🐳 **Docker Deployment**

### **Orchestrated Startup (Recommended)**

```bash
# Use the orchestrated startup script for step-by-step service startup
chmod +x start-orchestrated.sh
./start-orchestrated.sh
```

### **Quick Docker Start**

```bash
# Build and start all services
docker compose up --build

# Or run in background
docker compose up -d --build
```

### **Individual Service Control**

```bash
# Start only backend services
docker compose up -d mongodb redis backend

# Start only frontend
docker compose up -d frontend

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down
```

### **Docker Services**

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080  
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

---

## 📋 **Available Commands**

### **Backend Commands**

```bash
cd src/backend

# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
npm run start:prod         # Start production build

# Database
npm run seed              # Seed with 200 robots
npm run seed:advanced     # Seed with 7 days history (5,600 records)
npm run db:clean          # Clean database
npm run db:reset          # Clean + seed

# Utilities
npm run simulator         # Start robot simulator
npm run build             # Build for production
npm run lint              # Lint code
npm run test              # Run tests
```

### **Frontend Commands**

```bash
cd src/frontend

# Development
npm run dev               # Start development server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Lint code
```

### **Docker Commands**

```bash
# Development
docker compose up --build        # Build and start all
docker compose up -d            # Start in background
docker compose down             # Stop all services
docker compose logs -f          # Follow logs

# Production
docker compose -f docker-compose.prod.yml up -d

# Cleanup
docker compose down -v          # Remove volumes
docker system prune -f          # Clean unused images
```

---

## 🌐 **Service URLs**

### **Development**

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React dashboard |
| Backend API | http://localhost:8080 | NestJS REST API |
| API Docs | http://localhost:8080/api/v1/docs | Swagger documentation |
| WebSocket | ws://localhost:8080/socket.io | Socket.IO endpoint |
| Dashboard WebSocket | ws://localhost:8080/dashboard | Dashboard namespace |
| Health Check | http://localhost:8080/health | Service health |
| MongoDB | mongodb://localhost:27017 | Database |

### **Docker**

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Dockerized frontend |
| Backend | http://localhost:8080 | Dockerized backend |
| MongoDB | localhost:27017 | Dockerized database |
| Redis | localhost:6379 | Dockerized cache |

---

## 🔧 **Configuration**

### **Backend Environment (.env)**

```env
# Server
NODE_ENV=development
PORT=8080

# Database
MONGODB_URI=mongodb://localhost:27017/robot-dashboard

# CORS
CORS_ORIGIN=http://localhost:3000

# WebSocket
WEBSOCKET_PORT=8080

# Seeding
SEED_ON_START=true
```

### **Frontend Environment (.env.local)**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=http://localhost:8080
NEXT_PUBLIC_WS_DASHBOARD_URL=http://localhost:8080/dashboard
NEXT_PUBLIC_WS_ROBOT_URL=http://localhost:8080
```

---

## 📊 **Project Features Status**

### ✅ **Completed Features**

**Backend Implementation:**
- REST API with NestJS and TypeScript
- MongoDB integration with Mongoose ODM
- WebSocket real-time communication (Socket.IO)
- JWT authentication and authorization
- Health check endpoints
- Database seeding with sample data
- API documentation with Swagger
- Docker containerization
- Environment configuration management

**Frontend Implementation:**
- Next.js 14 with React 18 and TypeScript
- Responsive dashboard interface
- Real-time robot status monitoring
- Individual robot detail pages
- WebSocket integration for live updates
- Interactive data visualization
- Mobile-friendly responsive design
- Component-based architecture

**Infrastructure:**
- Docker Compose multi-service setup
- Service health checks and dependencies
- MongoDB and Redis containers
- Automated database seeding
- Development and production environments

### � **In Progress Features**

**Real-time Enhancements:**
- Advanced WebSocket event handling
- Real-time dashboard metrics
- Live robot telemetry streaming
- Performance monitoring dashboards

**User Interface Improvements:**
- Enhanced robot control interface
- Advanced data filtering and search
- Custom dashboard layouts
- Notification system implementation

**Backend Optimizations:**
- Rate limiting implementation
- Advanced error handling
- Logging system enhancement
- Database query optimization

### 📋 **To Do Features**

**Authentication & Security:**
- User role-based access control
- Two-factor authentication (2FA)
- Session management improvements
- Security audit and penetration testing

**Advanced Functionality:**
- Multi-robot fleet management
- Task scheduling and automation
- Historical data analytics
- Predictive maintenance alerts
- Data export (CSV, PDF, JSON)
- Advanced reporting system

**Mobile & Performance:**
- Progressive Web App (PWA) features
- Mobile application development
- Performance optimization
- Caching strategies implementation
- Code splitting and lazy loading

**Testing & Quality:**
- Comprehensive unit test suite
- Integration testing framework
- End-to-end testing with Cypress
- Load testing and performance benchmarks
- Code coverage reporting

**DevOps & Deployment:**
- CI/CD pipeline setup
- Kubernetes deployment configuration
- Monitoring with Prometheus and Grafana
- Automated backup systems
- Production logging and alerting

---

## 📊 **Features**

### **✅ Completed Features**

#### **Backend (NestJS)**
- ✅ **REST API with NestJS** - Complete CRUD operations for robots
- ✅ **MongoDB Integration** - Mongoose ODM with robot data models
- ✅ **WebSocket Gateways** - Real-time communication with Socket.IO
  - ✅ Robot Gateway (default namespace)
  - ✅ Dashboard Gateway (/dashboard namespace)
- ✅ **Health Check Endpoints** - Service monitoring and status
- ✅ **Swagger API Documentation** - Complete API documentation at `/api/v1/docs`
- ✅ **Database Seeding** - Automatic population with sample data
  - ✅ Basic seeding (200 robots)
  - ✅ Advanced seeding (7 days historical data, 5,600 records)
- ✅ **Environment Configuration** - Flexible configuration management
- ✅ **UUID-based Robot IDs** - Secure, non-predictable identifiers
- ✅ **CORS Configuration** - Frontend-backend communication
- ✅ **Docker Support** - Containerized deployment
- ✅ **Service Dependencies** - Robust startup with health checks

#### **Frontend (Next.js)**
- ✅ **Robot Fleet Dashboard** - Main dashboard with fleet overview
- ✅ **Individual Robot Pages** - Detailed robot information and control
- ✅ **Real-time WebSocket Integration** - Live updates from backend
  - ✅ Robot-specific WebSocket connections
  - ✅ Dashboard-wide WebSocket updates
- ✅ **WebSocket Status Indicators** - Connection status display
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **TypeScript Implementation** - Type-safe development
- ✅ **Environment Configuration** - Configurable API and WebSocket URLs
- ✅ **Error Handling** - Graceful error states and fallbacks
- ✅ **Loading States** - User feedback during data fetching

#### **Infrastructure & DevOps**
- ✅ **Docker Compose Setup** - Multi-service orchestration
- ✅ **MongoDB Container** - Persistent database storage
- ✅ **Redis Container** - Caching and pub/sub support
- ✅ **Service Health Checks** - Automatic service monitoring
- ✅ **Orchestrated Startup Scripts** - Step-by-step service initialization
- ✅ **Development Scripts** - Quick setup and testing utilities
- ✅ **WebSocket Testing Tools** - Automated connection testing
- ✅ **Environment Management** - Development/production configurations

### **🔄 In Progress Features**

#### **Backend Enhancements**
- 🔄 **Authentication & Authorization** - JWT-based user authentication
- 🔄 **Rate Limiting** - API request throttling
- 🔄 **Logging System** - Structured logging with Winston
- 🔄 **Performance Monitoring** - Response time and error tracking

#### **Frontend Improvements**
- 🔄 **Robot Control Interface** - Direct robot command sending
- 🔄 **Historical Data Visualization** - Charts and graphs for robot metrics
- 🔄 **Real-time Notifications** - Toast notifications for events
- 🔄 **Advanced Filtering** - Filter robots by status, location, etc.

#### **Infrastructure**
- 🔄 **Production Docker Setup** - Optimized production configurations
- 🔄 **Load Balancing** - Nginx configuration for scaling

### **📋 Planned Features (To Do)**

#### **Backend Features**
- 📋 **User Management System** - Multi-user support with roles
- 📋 **Robot Command Queue** - Queued command execution
- 📋 **Data Analytics API** - Statistical analysis endpoints
- 📋 **File Upload System** - Robot firmware and configuration uploads
- 📋 **Backup & Recovery** - Automated database backups
- 📋 **API Versioning** - Multiple API versions support
- 📋 **Webhook System** - External system integrations
- 📋 **Robot Simulation API** - Virtual robot testing
- 📋 **Geolocation Tracking** - GPS-based robot positioning
- 📋 **Alert System** - Automated notifications for critical events

#### **Frontend Features**
- 📋 **User Authentication UI** - Login/logout interface
- 📋 **Dashboard Customization** - User-configurable dashboard layouts
- 📋 **Robot Map View** - Geographical robot positioning
- 📋 **Advanced Charts** - Interactive data visualizations
- 📋 **Dark/Light Theme** - User preference themes
- 📋 **Mobile App** - React Native mobile application
- 📋 **Offline Support** - PWA with offline capabilities
- 📋 **Export Functionality** - Data export to CSV/PDF
- 📋 **Real-time Chat** - Communication between operators
- 📋 **Robot Scheduling** - Task scheduling interface

#### **Advanced Features**
- 📋 **Machine Learning Integration** - Predictive maintenance
- 📋 **Video Streaming** - Live camera feeds from robots
- 📋 **Voice Commands** - Voice control interface
- 📋 **AR/VR Interface** - Immersive robot control
- 📋 **Multi-Language Support** - Internationalization (i18n)
- 📋 **Plugin System** - Extensible architecture
- 📋 **Edge Computing** - Distributed processing capabilities

#### **Infrastructure & DevOps**
- 📋 **Kubernetes Deployment** - Container orchestration
- 📋 **CI/CD Pipeline** - Automated testing and deployment
- 📋 **Monitoring & Alerting** - Prometheus + Grafana setup
- 📋 **Security Scanning** - Automated vulnerability assessment
- 📋 **Performance Testing** - Load testing and optimization
- 📋 **Multi-Environment Support** - Dev/Staging/Production pipelines
- 📋 **Auto-scaling** - Dynamic resource allocation
- 📋 **SSL/TLS Configuration** - Secure communications
- 📋 **Database Clustering** - High availability MongoDB setup
- 📋 **CDN Integration** - Global content delivery

### **🎯 Current Development Focus**

1. **🔄 Priority 1: Authentication System**
   - JWT implementation
   - User roles and permissions
   - Protected routes

2. **🔄 Priority 2: Real-time Robot Control**
   - Command interface
   - Live robot status updates
   - Command feedback system

3. **🔄 Priority 3: Data Visualization**
   - Historical charts
   - Performance metrics
   - Fleet analytics

### **📈 Feature Progress Overview**

| Category | Completed | In Progress | Planned | Total |
|----------|-----------|-------------|---------|-------|
| **Backend** | 8 | 4 | 10 | 22 |
| **Frontend** | 8 | 4 | 10 | 22 |
| **Infrastructure** | 8 | 2 | 10 | 20 |
| **Total** | **24** | **10** | **30** | **64** |

**Overall Progress: 37.5% Complete** 🚀

---

### **Dashboard Features**

- 📱 **Real-time Robot Fleet Overview**
- 📊 **Live Statistics** (Online, Offline, Maintenance, Charging)
- 🤖 **Individual Robot Details**
- 📈 **Historical Data Visualization**
- 🎮 **Remote Robot Control**
- 🔔 **Real-time Notifications**
- 🔌 **WebSocket Status Indicators**

### **Technical Features**

- ⚡ **WebSocket Real-time Communication**
- 🗄️ **MongoDB with Mongoose ODM**
- 🐳 **Docker Containerization with Service Dependencies**
- 📖 **Swagger API Documentation**
- 🔐 **UUID-based Robot IDs**
- 🧪 **Health Check Endpoints**
- 📊 **Database Seeding Tools**
- 🔄 **Automatic Database Seeding on First Startup**

---

## 🧪 **Testing**

### **Backend Testing**

```bash
cd src/backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test WebSocket
node test-websocket.js

# Test Dashboard WebSocket
node test-dashboard-websocket.js
```

### **API Testing**

```bash
# Health check
curl http://localhost:8080/health

# Get robots
curl http://localhost:8080/robots

# Get specific robot
curl http://localhost:8080/robots/{robot-id}

# Create robot
curl -X POST http://localhost:8080/robots \
  -H "Content-Type: application/json" \
  -d '{"status":"online","battery":85}'
```

### **WebSocket Testing**

```bash
# Test robot WebSocket
chmod +x test-websocket.js
node test-websocket.js

# Test dashboard WebSocket
chmod +x test-dashboard-websocket.js
node test-dashboard-websocket.js

# Test Docker build
chmod +x test-docker-fix.sh
./test-docker-fix.sh
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **MongoDB Connection Error**

```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB
mongod --config /usr/local/etc/mongod.conf

# Check Docker MongoDB
docker compose logs mongodb
```

#### **Port Already in Use**

```bash
# Kill process using port 8080
lsof -ti:8080 | xargs kill -9

# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### **WebSocket Connection Failed**

```bash
# Test WebSocket endpoint
curl http://localhost:8080/websocket/test

# Check backend logs
docker compose logs -f backend

# Test WebSocket connections
node test-websocket.js
node test-dashboard-websocket.js
```

#### **Docker Build Issues**

```bash
# Clean Docker cache
docker system prune -a -f

# Rebuild without cache
docker compose build --no-cache

# Check container logs
docker compose logs backend
docker compose logs frontend

# Test specific fix
./test-docker-fix.sh
```

### **Reset Everything**

```bash
# Stop all services
docker compose down -v

# Clean Docker
docker system prune -a -f

# Remove node_modules
rm -rf src/backend/node_modules src/frontend/node_modules

# Fresh install
cd src/backend && npm install
cd ../frontend && npm install

# Start fresh
docker compose up --build
```

### **Service Dependencies Issues**

```bash
# Use orchestrated startup
./start-orchestrated.sh

# Check service health
docker compose ps

# Wait for specific services
./wait-for-services.sh mongodb:mongodb:27017 redis:redis:6379
```

---

## 📁 **Project Structure**

```
robotic-dashboard/
├── src/
│   ├── backend/          # NestJS API server and Websocket server
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── controllers/
│   │   │   ├── infrastructure/
│   │   │   │   └── socket/
│   │   │   │       └── gateways/
│   │   │   │           ├── robot.gateway.ts
│   │   │   │           └── dashboard.gateway.ts
│   │   │   └── config/
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── docker-entrypoint-simple.sh
│   └── frontend/         # Next.js dashboard
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/
│       │   │   └── robot/
│       │   ├── config/
│       │   │   ├── api.config.ts
│       │   │   └── websocket.config.ts
│       │   └── hooks/
│       │       └── useRobotWebSocket.ts
│       ├── package.json
│       └── Dockerfile
├── docker-compose.yml    # Docker services with dependencies
├── start-orchestrated.sh # Orchestrated startup script
├── wait-for-services.sh  # Service dependency helper
├── quick-start.sh        # Quick setup script
├── test-websocket.js     # Robot WebSocket test
├── test-dashboard-websocket.js # Dashboard WebSocket test
├── test-docker-fix.sh    # Docker build test
└── README.md
```

---

## 🚀 **Deployment**

### **Production Docker**

```bash
# Build images
docker compose -f  build

# Start stack
docker compose -f up -d

# Monitor
docker compose -f logs -f
```

### **Environment Variables**

Update production environment variables in:
- `src/backend/.env.production`
- `src/frontend/.env.production`

### **Production Considerations**

- Set `SEED_ON_START=false` in production
- Configure proper MongoDB authentication
- Use environment-specific WebSocket URLs
- Enable Redis for scaling
- Configure Nginx for load balancing

---

## 📚 **API Documentation**

Once the backend is running, visit:
**http://localhost:8080/api/v1/docs**

### **WebSocket Namespaces**

- **Robot Gateway**: `ws://localhost:8080` (default namespace)
- **Dashboard Gateway**: `ws://localhost:8080/dashboard`

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with provided test scripts
5. Submit a pull request

---

## 📄 **License**

MIT License - see LICENSE file for details.