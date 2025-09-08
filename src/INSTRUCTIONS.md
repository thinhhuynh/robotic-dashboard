# Robot Fleet Management Dashboard

A real-time robot fleet management system built with **Node.js**, **Next.js**, **MongoDB**, and **uWebSockets.js**. This application demonstrates live robot monitoring, alert systems, and historical data visualization.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Robot Fleet   │◄──►│  uWebSocket.js  │◄──►│   Dashboard     │
│   Simulators    │    │     Server      │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                      ┌─────────────────┐
                      │    MongoDB      │
                      │                 │
                      └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB** (or use Docker)

### 1. Setup

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

**Start MongoDB** (ensure it's running on `mongodb://localhost:27017`)

### Robot Data Format

Each robot sends telemetry data every second in this format:

```javascript
{
  robotId: "ROBOT_001",
  batteryPercentage: 85.5,      // 0-100%
  wifiSignalStrength: -45,      // -100 to 0 dBm  
  isCharging: false,
  temperature: 42.3,            // CPU temp in Celsius
  memoryUsage: 67,              // 0-100%
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

Can check the backend/simulator/robot-simulator.js for more details.

``` bash
# tart the robot simulator
cd backend && npm run simulator
```

### What's Already Prepared

The boilerplate includes a complete foundation so you can focus on core business logic:

- ✅ **Backend Infrastructure**: uWebSockets.js server, MongoDB connection, robot simulator
- ✅ **Frontend Foundation**: Next.js app with TypeScript, Ant Design, WebSocket hooks
- ✅ **Development Environment**: All dependencies installed, npm scripts configured
- ✅ **Type Definitions**: Complete TypeScript interfaces for type safety
