# Robotic Dashboard

A comprehensive robot fleet management system built with **NestJS** backend and **Next.js** frontend, featuring real-time WebSocket communication, MongoDB storage, and Docker deployment.

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
cd /Users/thinhhd/working/WeenSpace/robotic-dashboard/src/backend

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

# Start frontend in development mode
npm run dev
```

**✅ Frontend running at:** `http://localhost:3000`

#### **🧪 Step 3: Verify Everything Works**

1. **Backend Health**: <http://localhost:8080/health>
2. **API Documentation**: <http://localhost:8080/api/docs>
3. **WebSocket Test**: <http://localhost:8080/websocket/test>
4. **Frontend Dashboard**: <http://localhost:3000/dashboard>

---

### **Option 2: Docker Mode (One Command Setup)**

```bash
# Navigate to project root
cd /Users/thinhhd/working/WeenSpace/robotic-dashboard

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
npm run dev

# 4. Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080/api/docs
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

---

## 🐳 **Docker Deployment**

### **Quick Docker Start**
```bash
# Build and start all services
docker compose up --build

# Or run in background
docker compose up -d --build
```

### **Individual Service Control**
```bash
# Start only backend
docker compose up backend mongodb

# Start only frontend
docker compose up frontend

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
| API Docs | http://localhost:8080/api/docs | Swagger documentation |
| WebSocket | ws://localhost:8080/socket.io | Socket.IO endpoint |
| Health Check | http://localhost:8080/health | Service health |
| MongoDB | mongodb://localhost:27017 | Database |

### **Docker**
| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Dockerized frontend |
| Backend | http://localhost:8080 | Dockerized backend |
| MongoDB | localhost:27017 | Dockerized database |

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
```

### **Frontend Environment (.env.local)**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080
```

---

## 📊 **Features**

### **Dashboard Features**
- 📱 **Real-time Robot Fleet Overview**
- 📊 **Live Statistics** (Online, Offline, Maintenance, Charging)
- 🤖 **Individual Robot Details**
- 📈 **Historical Data Visualization**
- 🎮 **Remote Robot Control**
- 🔔 **Real-time Notifications**

### **Technical Features**
- ⚡ **WebSocket Real-time Communication**
- 🗄️ **MongoDB with Mongoose ODM**
- 🐳 **Docker Containerization**
- 📖 **Swagger API Documentation**
- 🔐 **UUID-based Robot IDs**
- 🧪 **Health Check Endpoints**
- 📊 **Database Seeding Tools**

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

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **MongoDB Connection Error**
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB
mongod --config /usr/local/etc/mongod.conf
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

---

## 📁 **Project Structure**

```
robotic-dashboard/
├── src/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── frontend/         # Next.js dashboard
│       ├── src/
│       ├── package.json
│       └── Dockerfile
├── docker-compose.yml    # Docker services
├── test-websocket.js     # WebSocket test script
└── README.md
```

---

## 🚀 **Deployment**

### **Production Docker**
```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production stack
docker compose -f docker-compose.prod.yml up -d

# Monitor
docker compose -f docker-compose.prod.yml logs -f
```

### **Environment Variables**
Update production environment variables in:
- `src/backend/.env.production`
- `src/frontend/.env.production`

---

## 📚 **API Documentation**

Once the backend is running, visit:
**http://localhost:8080/api/docs**

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 **License**

MIT License - see LICENSE file for details.