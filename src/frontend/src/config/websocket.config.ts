// WebSocket Configuration
export const WS_CONFIG = {
  // Base WebSocket URL
  BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL || 'http://localhost:8080',
  
  // Dashboard WebSocket URL
  DASHBOARD_URL: process.env.NEXT_PUBLIC_WS_BASE_URL
    ? `${process.env.NEXT_PUBLIC_WS_BASE_URL}/dashboard`
    : 'http://localhost:8080/dashboard',

  // Robot WebSocket URL (default namespace)
  ROBOT_URL: process.env.NEXT_PUBLIC_WS_BASE_URL
    ? `${process.env.NEXT_PUBLIC_WS_BASE_URL}/robot`
    : 'http://localhost:8080/robot',
  
  // Connection options
  OPTIONS: {
    transports: ['websocket', 'polling'] as const,
    timeout: 10000,
    forceNew: true,
    autoConnect: true,
  },
  
  // Retry configuration
  RETRY: {
    attempts: 3,
    delay: 5000,
  },
  
  // Channels
  CHANNELS: {
    DASHBOARD_UPDATES: 'dashboard-updates',
    ROBOT_PREFIX: 'robot:',
  },
} as const;

// Helper function to get robot-specific channel
export const getRobotChannel = (robotId: string) => `${WS_CONFIG.CHANNELS.ROBOT_PREFIX}${robotId}`;

// Helper function to log WebSocket connection
export const logWebSocketConnection = (type: string, url: string, socketId?: string) => {
  console.log(`🔌 ${type} WebSocket connection`);
  console.log(`📡 URL: ${url}`);
  if (socketId) {
    console.log(`🆔 Socket ID: ${socketId}`);
  }
};

export default WS_CONFIG;