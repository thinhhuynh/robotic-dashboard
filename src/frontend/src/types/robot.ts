export interface Robot {
  robotId: string
  batteryPercentage: number
  wifiSignalStrength: number
  isCharging: boolean
  temperature: number
  memoryUsage: number
  timestamp: string
  lastSeen?: string
  status?: 'online' | 'offline' | 'warning'
}

export interface RobotData extends Robot {
  _id?: string
}

export interface Alert {
  id: string
  robotId: string
  type: 'low_battery' | 'critical_battery' | 'offline'
  message: string
  timestamp: string
  acknowledged?: boolean
}

export interface WebSocketMessage {
  type: 'robot_update' | 'robot_connected' | 'robot_disconnected' | 'initial_robots'
  robotId?: string
  data?: Robot
  robots?: string[]
}

export interface ChartDataPoint {
  timestamp: string
  batteryPercentage: number
  wifiSignalStrength: number
  temperature: number
  memoryUsage: number
}

export interface RobotMetrics {
  robotId: string
  avgBattery: number
  avgTemperature: number
  avgMemoryUsage: number
  avgWifiSignal: number
  lastSeen: string
  totalDataPoints: number
}