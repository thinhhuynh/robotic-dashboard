"use client";

import { useState, useEffect } from 'react';
import { API_CONFIG, apiRequest } from '../../config/api';

interface Robot {
  _id: string;
  robotId: string;
  status: 'online' | 'offline' | 'maintenance';
  battery: number;
  wifiStrength: number;
  charging: boolean;
  temperature: number;
  memory: number;
  timestamp: string;
  location?: {
    x: number;
    y: number;
    z: number;
  };
  lastError?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

interface ApiResponse {
  items: Robot[];
  total: number;
  offset: number;
  limit: number;
}

export default function DashboardPage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard WebSocket states
  const [dashboardSocket, setDashboardSocket] = useState<any>(null);
  const [dashboardConnectionStatus, setDashboardConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);

  const fetchRobots = async () => {
    try {
      setLoading(true);
      const data: ApiResponse = await apiRequest<ApiResponse>(API_CONFIG.ENDPOINTS.ROBOTS);
      setRobots(data.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch robots');
      console.error('Error fetching robots:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Dashboard WebSocket connection
  const initializeDashboardWebSocket = async () => {
    try {
      console.log('🔌 Connecting to Dashboard WebSocket...');
      setDashboardConnectionStatus('connecting');

      // Use Socket.IO client to connect to dashboard namespace
      const { io } = await import('socket.io-client');
      
      const socket = io('http://localhost:8080/dashboard', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('✅ Dashboard WebSocket connected');
        console.log(`📡 Dashboard Socket ID: ${socket.id}`);
        setDashboardConnectionStatus('connected');
        
        // Subscribe to dashboard updates
        socket.emit('subscribe', 'dashboard-updates');
        console.log('📡 Subscribed to dashboard updates');
      });

      socket.on('disconnect', () => {
        console.log('❌ Dashboard WebSocket disconnected');
        setDashboardConnectionStatus('disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Dashboard WebSocket connection error:', error);
        setDashboardConnectionStatus('disconnected');
      });

      // Handle dashboard-specific events
      socket.on('dashboard-update', (data) => {
        console.log('📊 Dashboard update received:', data);
        setRealTimeUpdates(prev => [{
          timestamp: new Date().toISOString(),
          type: 'dashboard-update',
          data
        }, ...prev.slice(0, 9)]);
        
        // Update robots data if it's a fleet update
        if (data.type === 'fleet-update' && data.robots) {
          setRobots(data.robots);
        }
      });

      socket.on('robot-status-change', (data) => {
        console.log('🤖 Robot status change:', data);
        setRealTimeUpdates(prev => [{
          timestamp: new Date().toISOString(),
          type: 'robot-status-change',
          data
        }, ...prev.slice(0, 9)]);
        
        // Update specific robot in the list
        if (data.robotId) {
          setRobots(prev => prev.map(robot => 
            robot.robotId === data.robotId 
              ? { ...robot, ...data.updates, timestamp: new Date().toISOString() }
              : robot
          ));
        }
      });

      socket.on('fleet-statistics', (data) => {
        console.log('📈 Fleet statistics update:', data);
        setRealTimeUpdates(prev => [{
          timestamp: new Date().toISOString(),
          type: 'fleet-statistics',
          data
        }, ...prev.slice(0, 9)]);
      });

      setDashboardSocket(socket);

    } catch (error) {
      console.error('Failed to connect to Dashboard WebSocket:', error);
      console.log('💡 Install socket.io-client: npm install socket.io-client');
      setDashboardConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    fetchRobots();
  }, []);

  // Initialize Dashboard WebSocket after initial data load
  useEffect(() => {
    if (!loading && !error && !dashboardSocket) {
      console.log('🚀 Initializing Dashboard WebSocket...');
      initializeDashboardWebSocket();
    }

    // Cleanup on unmount
    return () => {
      if (dashboardSocket) {
        console.log('🧹 Cleaning up Dashboard WebSocket connection...');
        dashboardSocket.emit('unsubscribe', 'dashboard-updates');
        dashboardSocket.disconnect();
        setDashboardSocket(null);
      }
    };
  }, [loading, error, dashboardSocket]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'offline': return '#ff4d4f';
      case 'maintenance': return '#faad14';
      default: return '#d9d9d9';
    }
  };

  const getStats = () => {
    const online = robots.filter(r => r.status === 'online').length;
    const offline = robots.filter(r => r.status === 'offline').length;
    const maintenance = robots.filter(r => r.status === 'maintenance').length;
    const charging = robots.filter(r => r.charging).length;
    return { online, offline, maintenance, charging };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h1>Loading robots...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Error Loading Dashboard</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={fetchRobots} style={{ padding: '8px 16px', marginTop: '16px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "24px", color: "#1890ff" }}>
        Robot Fleet Dashboard
      </h1>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Robots</h3>
          <p style={{ fontSize: '24px', margin: '8px 0', fontWeight: 'bold' }}>{robots.length}</p>
        </div>
        <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Online</h3>
          <p style={{ fontSize: '24px', margin: '8px 0', fontWeight: 'bold', color: '#52c41a' }}>{stats.online}</p>
        </div>
        <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Offline</h3>
          <p style={{ fontSize: '24px', margin: '8px 0', fontWeight: 'bold', color: '#ff4d4f' }}>{stats.offline}</p>
        </div>
        <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Maintenance</h3>
          <p style={{ fontSize: '24px', margin: '8px 0', fontWeight: 'bold', color: '#faad14' }}>{stats.maintenance}</p>
        </div>
        <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Charging</h3>
          <p style={{ fontSize: '24px', margin: '8px 0', fontWeight: 'bold', color: '#1890ff' }}>{stats.charging}</p>
        </div>
      </div>

      {/* Robots Table */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#1890ff',
          marginBottom: '8px' 
        }}>
          Robot Fleet List
        </h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Real-time status and telemetry data for all robots
        </p>
      </div>

      <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #d9d9d9' }}>
              <th style={{ 
                padding: '16px 12px', 
                textAlign: 'left', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#262626',
                borderRight: '1px solid #f0f0f0'
              }}>
                🤖 Robot ID
              </th>
              <th style={{ 
                padding: '16px 12px', 
                textAlign: 'left', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#262626',
                borderRight: '1px solid #f0f0f0'
              }}>
                🔴 Status
              </th>
              <th style={{ 
                padding: '16px 12px', 
                textAlign: 'left', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#262626',
                borderRight: '1px solid #f0f0f0',
                width: '120px'
              }}>
                🔋 Battery
              </th>
              <th style={{ 
                padding: '16px 12px', 
                textAlign: 'left', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#262626',
                borderRight: '1px solid #f0f0f0'
              }}>
                📶 WiFi Signal
              </th>
              <th style={{ 
                padding: '16px 12px', 
                textAlign: 'left', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#262626',
                borderRight: '1px solid #f0f0f0',
                width: '140px'
              }}>
                🌡️ Temperature
              </th>
              <th style={{ 
                padding: '16px 12px', 
                textAlign: 'left', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#262626',
                borderRight: '1px solid #f0f0f0',
                width: '140px'
              }}>
                💾 Memory Usage
              </th>
              <th style={{ 
                padding: '16px 12px', 
                textAlign: 'left', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#262626',
                borderRight: '1px solid #f0f0f0'
              }}>
                📍 Location
              </th>
              <th style={{ 
                padding: '16px 12px', 
                textAlign: 'left', 
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#262626'
              }}>
                ⚠️ Last Error
              </th>
            </tr>
          </thead>
          <tbody>
            {robots.map((robot, index) => (
              <tr key={robot._id} style={{ borderBottom: index < robots.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                  <a 
                    href={`/dashboard/${robot.robotId}/detail`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#1890ff', 
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                    onMouseOver={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                  >
                    {robot.robotId.slice(0, 8)}...
                  </a>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: getStatusColor(robot.status),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {robot.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {robot.battery}% {robot.charging && <span style={{ color: '#1890ff' }}>⚡</span>}
                </td>
                <td style={{ padding: '12px' }}>
                  {robot.wifiStrength} dBm
                </td>
                <td style={{ padding: '12px' }}>
                  {robot.temperature}°C
                </td>
                <td style={{ padding: '12px' }}>
                  {robot.memory}%
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                  {robot.location ? 
                    `(${robot.location.x.toFixed(1)}, ${robot.location.y.toFixed(1)})` : 
                    'No location'
                  }
                </td>
                <td style={{ padding: '12px' }}>
                  {robot.lastError ? (
                    <div>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        fontSize: '10px'
                      }}>
                        {robot.lastError.code}
                      </span>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {robot.lastError.message}
                      </div>
                    </div>
                  ) : (
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      backgroundColor: '#52c41a',
                      color: 'white',
                      fontSize: '10px'
                    }}>
                      No Error
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', color: '#666' }}>
        Showing {robots.length} robots
      </div>

      {/* Real-time Dashboard Updates */}
      {dashboardConnectionStatus === 'connected' && realTimeUpdates.length > 0 && (
        <div style={{ 
          padding: '20px', 
          border: '1px solid #d9d9d9', 
          borderRadius: '8px',
          marginTop: '24px'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>📈 Real-time Dashboard Updates</h3>
          
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: '#fafafa'
          }}>
            {realTimeUpdates.map((update, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '8px 12px',
                  marginBottom: '8px',
                  backgroundColor: update.type === 'dashboard-update' ? '#e6f7ff' : 
                                  update.type === 'robot-status-change' ? '#f6ffed' :
                                  update.type === 'fleet-statistics' ? '#fff7e6' : '#f0f0f0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  borderLeft: '3px solid ' + (
                    update.type === 'dashboard-update' ? '#1890ff' : 
                    update.type === 'robot-status-change' ? '#52c41a' :
                    update.type === 'fleet-statistics' ? '#faad14' : '#d9d9d9'
                  )
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {update.type === 'dashboard-update' ? '📊 DASHBOARD UPDATE' : 
                     update.type === 'robot-status-change' ? '🤖 ROBOT STATUS' :
                     update.type === 'fleet-statistics' ? '📈 FLEET STATS' : '📨 UPDATE'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {JSON.stringify(update.data, null, 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard WebSocket Status Info */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        textAlign: 'center',
        marginTop: '24px'
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Dashboard WebSocket Status: <span style={{
            color: dashboardConnectionStatus === 'connected' ? '#52c41a' : 
                   dashboardConnectionStatus === 'connecting' ? '#faad14' : '#ff4d4f',
            fontWeight: 'bold'
          }}>
            {dashboardConnectionStatus.toUpperCase()}
          </span>
        </div>
        {dashboardConnectionStatus === 'connected' && (
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
            🔄 Listening for real-time fleet updates on /dashboard channel
          </div>
        )}
        {dashboardConnectionStatus === 'disconnected' && (
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#ff4d4f' }}>
            ⚠️ Real-time updates disabled. Check WebSocket connection.
          </div>
        )}
      </div>
    </div>
  );
}