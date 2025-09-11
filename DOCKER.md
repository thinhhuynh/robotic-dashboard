# 🐳 Docker Support for Robotic Dashboard

This project includes comprehensive Docker support with Node.js 22 for easy development and deployment.

## 🚀 Quick Start

### Production Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Development Mode
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View development logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## 📦 Services

### 🗄️ MongoDB (Port 27017)
- **Image**: `mongo:7.0`
- **Database**: `robotic_dashboard`
- **Credentials**: `admin:password123`
- **Features**: Auto-initialized with sample data

### 🔧 Backend API (Port 8080)
- **Base**: `node:22-alpine`
- **Framework**: NestJS
- **Features**: REST API, WebSocket Gateway, MongoDB integration

### 🎨 Frontend (Port 3000)
- **Base**: `node:22-alpine`
- **Framework**: Next.js 14
- **Features**: React UI, Socket.IO client, Robot dashboard

### 📡 WebSocket Server (Port 8081)
- **Base**: `node:22-alpine`
- **Features**: Standalone WebSocket server for real-time updates

## 🛠️ Development Commands

### Individual Service Management
```bash
# Backend only
docker-compose up backend mongodb

# Frontend only
docker-compose up frontend

# Database only
docker-compose up mongodb
```

### Database Operations
```bash
# Access MongoDB shell
docker exec -it robotic-dashboard-mongodb-dev mongosh -u admin -p password123

# Reset database
docker-compose down -v
docker-compose up -d
```

### Debugging
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All service logs
docker-compose logs -f
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://admin:password123@mongodb:27017/robotic_dashboard?authSource=admin
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080
```

## 📊 Sample Data

The MongoDB container automatically initializes with:
- **3 Sample Robots**: robot-001, robot-002, robot-003
- **Historical Data**: 7 days of hourly records per robot
- **Indexes**: Optimized for performance
- **User Account**: `roboticapp:roboticpass123`

## 🔍 Health Checks

### Service Health
```bash
# Backend API health
curl http://localhost:8080/api/v1/health

# Frontend
curl http://localhost:3000

# MongoDB
docker exec robotic-dashboard-mongodb-dev mongosh --eval "db.adminCommand('ping')"
```

### WebSocket Testing
```bash
# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" \
     -H "Sec-WebSocket-Version: 13" \
     http://localhost:8080/socket.io/
```

## 🧹 Cleanup

### Remove All Containers and Volumes
```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -a
```

### Reset Development Environment
```bash
# Reset dev environment
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d --build
```

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :27017 # MongoDB

# Kill processes if needed
sudo kill -9 $(lsof -t -i:3000)
```

#### Container Build Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# Pull latest base images
docker-compose pull
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER ./src

# Docker daemon issues
sudo systemctl restart docker
```

### Container Access
```bash
# Backend container shell
docker exec -it robotic-dashboard-backend-dev sh

# Frontend container shell
docker exec -it robotic-dashboard-frontend-dev sh

# MongoDB container shell
docker exec -it robotic-dashboard-mongodb-dev sh
```

## 📈 Performance Tips

1. **Use .dockerignore**: Already configured to exclude unnecessary files
2. **Multi-stage builds**: Optimized Dockerfiles for smaller images
3. **Volume mounting**: Fast development with live reload
4. **Layer caching**: Organized COPY commands for better caching

## 🔐 Security Notes

- Change default passwords in production
- Use environment-specific configurations
- Enable MongoDB authentication
- Configure proper CORS origins
- Use HTTPS in production

## 📚 Additional Resources

- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

🎉 **Happy Dockerizing!** Your robotic dashboard is now fully containerized with Node.js 22 support!