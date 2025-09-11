"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_CONFIG, apiRequest } from '../../../../config/api';
import { RobotWebSocketManager } from '../../../../utils/robotWebSocket';

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

interface RobotHistory {
  timestamp: string;
  status: string;
  battery: number;
  temperature: number;
  memory: number;
  location?: {
    x: number;
    y: number;
    z: number;
  };
  event?: string;
  message?: string;
}

export default function RobotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const robotId = params.robot_id as string;
  
  const [robot, setRobot] = useState<Robot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  
  // History data state
  const [historyData, setHistoryData] = useState<RobotHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyHours, setHistoryHours] = useState(10);
  
  // WebSocket states
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([]);
  const wsManagerRef = useRef<RobotWebSocketManager | null>(null);

  const fetchRobotDetail = async () => {
    try {
      setLoading(true);
      const data: Robot = await apiRequest<Robot>(API_CONFIG.ENDPOINTS.ROBOT_DETAIL(robotId));
      setRobot(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch robot details');
      console.error('Error fetching robot details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRobotHistory = async (hours: number = 10) => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      
      const endpoint = `/robots/${robotId}/history?hours=${hours}`;
      console.log(`📊 Fetching robot history: ${API_CONFIG.BASE_URL}${endpoint}`);
      
      const data: RobotHistory[] = await apiRequest<RobotHistory[]>(endpoint);
      setHistoryData(data);
      console.log(`✅ Loaded ${data.length} history records`);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to fetch robot history');
      console.error('Error fetching robot history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Initialize WebSocket connection when page loads successfully
  const initializeWebSocket = async () => {
    if (!robotId || wsManagerRef.current) return;

    console.log(`� Initializing WebSocket for robot: ${robotId}`);
    
    const wsManager = new RobotWebSocketManager(robotId);
    wsManagerRef.current = wsManager;

    // Set up event listeners
    wsManager.onStatusChange((status) => {
      setConnectionStatus(status as 'connecting' | 'connected' | 'disconnected');
    });

    wsManager.onUpdatesChange((updates) => {
      setRealTimeUpdates(updates);
    });

    wsManager.onUpdate((data: Partial<Robot>) => {
      setRobot(prevData => ({
        ...prevData,
        ...data,
        timestamp: new Date().toISOString(),
      } as Robot));
    });

    wsManager.onStatus((status: string) => {
      setRobot(prev => prev ? {
        ...prev,
        status: status as any,
        timestamp: new Date().toISOString(),
      } : null);
    });

    wsManager.onData((data: Robot) => {
      setRobot(data);
    });

    // Attempt to connect
    const connected = await wsManager.connect();
    if (!connected) {
      console.warn('⚠️ WebSocket connection failed. Real-time features disabled.');
      console.log('💡 To enable WebSocket features, install: npm install socket.io-client');
    }
  };

  // Send command to robot via WebSocket
  const sendRobotCommand = (command: string, params?: any) => {
    if (wsManagerRef.current) {
      const success = wsManagerRef.current.sendCommand(command, params);
      if (!success) {
        console.warn('WebSocket not connected, cannot send command');
      }
    } else {
      console.warn('WebSocket manager not initialized');
    }
  };

  useEffect(() => {
    if (robotId) {
      fetchRobotDetail();
    }
  }, [robotId]);

  // Load history data when history tab is activated
  useEffect(() => {
    if (activeTab === 'history' && robotId && !historyLoading && historyData.length === 0) {
      fetchRobotHistory(historyHours);
    }
  }, [activeTab, robotId, historyHours]);

  // Initialize WebSocket when robot data is loaded successfully
  useEffect(() => {
    if (robot && !loading && !error && !wsManagerRef.current) {
      console.log('🚀 Robot data loaded successfully, initializing WebSocket...');
      initializeWebSocket();
    }

    // Cleanup WebSocket on unmount
    return () => {
      if (wsManagerRef.current) {
        console.log('🧹 Cleaning up WebSocket connection...');
        wsManagerRef.current.disconnect();
        wsManagerRef.current = null;
      }
    };
  }, [robot, loading, error, robotId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'offline': return '#ff4d4f';
      case 'maintenance': return '#faad14';
      default: return '#d9d9d9';
    }
  };

  const getBatteryColor = (battery: number, charging: boolean) => {
    if (charging) return '#1890ff';
    if (battery > 50) return '#52c41a';
    if (battery > 20) return '#faad14';
    return '#ff4d4f';
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h1>Loading robot details...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Error Loading Robot Details</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={fetchRobotDetail} style={{ padding: '8px 16px', marginTop: '16px' }}>
          Retry
        </button>
        <button 
          onClick={() => router.push('/dashboard')} 
          style={{ padding: '8px 16px', marginTop: '16px', marginLeft: '8px' }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!robot) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Robot Not Found</h1>
        <p>Robot with ID {robotId} was not found.</p>
        <button 
          onClick={() => router.push('/dashboard')} 
          style={{ padding: '8px 16px', marginTop: '16px' }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#1890ff', marginBottom: '8px' }}>
            🤖 Robot Details
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{robot.robotId}</span>
          </p>
          
          {/* WebSocket Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', fontSize: '14px' }}>
            <span style={{ marginRight: '8px' }}>🔌 WebSocket:</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: connectionStatus === 'connected' ? '#52c41a' : 
                                  connectionStatus === 'connecting' ? '#faad14' : '#ff4d4f',
                  marginRight: '6px',
                }}
              />
              <span style={{ 
                textTransform: 'capitalize',
                color: connectionStatus === 'connected' ? '#52c41a' : 
                       connectionStatus === 'connecting' ? '#faad14' : '#ff4d4f',
                fontWeight: 'bold'
              }}>
                {connectionStatus}
              </span>
              {connectionStatus === 'connected' && (
                <span style={{ marginLeft: '8px', color: '#666' }}>
                  Channel: robot:{robotId}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => router.push('/dashboard')} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        marginBottom: '24px',
        borderBottom: '1px solid #d9d9d9'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #1890ff' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'overview' ? '#1890ff' : '#666',
              fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #1890ff' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'history' ? '#1890ff' : '#666',
              fontWeight: activeTab === 'history' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📈 History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Status Overview */}
      <div style={{ 
        padding: '24px', 
        border: '1px solid #d9d9d9', 
        borderRadius: '8px', 
        marginBottom: '24px',
        backgroundColor: '#fafafa'
      }}>
        <h2 style={{ marginBottom: '16px', color: '#262626' }}>Status Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔴</div>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Status</h3>
            <span style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: getStatusColor(robot.status),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {robot.status.toUpperCase()}
            </span>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔋</div>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Battery</h3>
            <div>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: getBatteryColor(robot.battery, robot.charging) 
              }}>
                {robot.battery}%
              </span>
              {robot.charging && <div style={{ color: '#1890ff', fontSize: '12px' }}>⚡ Charging</div>}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌡️</div>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Temperature</h3>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#262626' }}>
              {robot.temperature}°C
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💾</div>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Memory</h3>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#262626' }}>
              {robot.memory}%
            </span>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Connectivity */}
        <div style={{ 
          padding: '20px', 
          border: '1px solid #d9d9d9', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>📶 Connectivity</h3>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>WiFi Strength:</span>
            <div style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '4px' }}>
              {robot.wifiStrength} dBm
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {robot.wifiStrength > -50 ? 'Excellent' : 
               robot.wifiStrength > -60 ? 'Good' : 
               robot.wifiStrength > -70 ? 'Fair' : 'Poor'}
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={{ 
          padding: '20px', 
          border: '1px solid #d9d9d9', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>📍 Location</h3>
          {robot.location ? (
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '16px', marginBottom: '8px' }}>
                <div>X: {robot.location.x.toFixed(2)}</div>
                <div>Y: {robot.location.y.toFixed(2)}</div>
                <div>Z: {robot.location.z.toFixed(2)}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#999', fontStyle: 'italic' }}>
              No location data available
            </div>
          )}
        </div>
      </div>

      {/* Error Information */}
      <div style={{ 
        padding: '20px', 
        border: '1px solid #d9d9d9', 
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>⚠️ Error Status</h3>
        {robot.lastError ? (
          <div>
            <div style={{ 
              padding: '8px 12px', 
              backgroundColor: '#ff4d4f', 
              color: 'white', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              marginBottom: '12px',
              display: 'inline-block'
            }}>
              {robot.lastError.code}
            </div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              {robot.lastError.message}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Occurred: {new Date(robot.lastError.timestamp).toLocaleString()}
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#52c41a', 
            color: 'white', 
            borderRadius: '4px', 
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            ✅ No Errors
          </div>
        )}
      </div>

      {/* Robot Controls */}
      <div style={{ 
        padding: '20px', 
        border: '1px solid #d9d9d9', 
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>🎮 Robot Controls</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => sendRobotCommand('start')}
            disabled={connectionStatus !== 'connected'}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: connectionStatus === 'connected' ? '#52c41a' : '#d9d9d9', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: connectionStatus === 'connected' ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            ▶️ Start Robot
          </button>
          
          <button 
            onClick={() => sendRobotCommand('stop')}
            disabled={connectionStatus !== 'connected'}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: connectionStatus === 'connected' ? '#ff4d4f' : '#d9d9d9', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: connectionStatus === 'connected' ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop Robot
          </button>
          
          <button 
            onClick={() => sendRobotCommand('maintenance')}
            disabled={connectionStatus !== 'connected'}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: connectionStatus === 'connected' ? '#faad14' : '#d9d9d9', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: connectionStatus === 'connected' ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            🔧 Maintenance
          </button>
          
          <button 
            onClick={() => sendRobotCommand('refresh')}
            disabled={connectionStatus !== 'connected'}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: connectionStatus === 'connected' ? '#1890ff' : '#d9d9d9', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: connectionStatus === 'connected' ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh Data
          </button>
        </div>
        
        {connectionStatus !== 'connected' && (
          <div style={{ 
            marginTop: '12px', 
            padding: '8px', 
            backgroundColor: '#fff7e6', 
            borderRadius: '4px',
            fontSize: '14px',
            color: '#d48806'
          }}>
            ⚠️ WebSocket not connected. Controls are disabled.
          </div>
        )}
      </div>

      {/* Real-time Updates Log */}
      <div style={{ 
        padding: '20px', 
        border: '1px solid #d9d9d9', 
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>📈 Real-time Updates</h3>
        
        {realTimeUpdates.length > 0 ? (
          <div style={{ 
            maxHeight: '300px', 
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
                  backgroundColor: update.type === 'command-sent' ? '#e6f7ff' : 
                                  update.type === 'update' ? '#f6ffed' :
                                  update.type === 'status' ? '#fff7e6' : '#f0f0f0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  borderLeft: '3px solid ' + (
                    update.type === 'command-sent' ? '#1890ff' : 
                    update.type === 'update' ? '#52c41a' :
                    update.type === 'status' ? '#faad14' : '#d9d9d9'
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
                    {update.type === 'command-sent' ? '📤 COMMAND' : 
                     update.type === 'update' ? '📊 UPDATE' :
                     update.type === 'status' ? '📡 STATUS' : 
                     update.type === 'subscription' ? '✅ SUBSCRIPTION' : '📨 EVENT'}
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
        ) : (
          <div style={{ 
            padding: '20px',
            textAlign: 'center',
            color: '#666',
            fontStyle: 'italic',
            backgroundColor: '#fafafa',
            borderRadius: '4px'
          }}>
            {connectionStatus === 'connected' 
              ? `🔄 Listening for real-time updates on channel: robot:${robotId}...`
              : '⚠️ Connect to WebSocket to see real-time updates'
            }
          </div>
        )}
      </div>

      {/* Last Update */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Last updated: {new Date(robot.timestamp).toLocaleString()}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button 
            onClick={fetchRobotDetail}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: 'transparent',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh via API
          </button>
          {connectionStatus === 'connected' && (
            <button 
              onClick={() => sendRobotCommand('refresh')}
              style={{ 
                padding: '6px 12px', 
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📡 Refresh via WebSocket
            </button>
          )}
        </div>
      </div>
        </>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div>
          {/* History Controls */}
          <div style={{ 
            padding: '20px', 
            border: '1px solid #d9d9d9', 
            borderRadius: '8px',
            marginBottom: '24px',
            backgroundColor: '#fafafa'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>📈 Robot History</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <label style={{ color: '#666', fontSize: '14px' }}>
                Time Range:
                <select 
                  value={historyHours}
                  onChange={(e) => setHistoryHours(Number(e.target.value))}
                  style={{
                    marginLeft: '8px',
                    padding: '6px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px'
                  }}
                >
                  <option value={1}>Last 1 hour</option>
                  <option value={6}>Last 6 hours</option>
                  <option value={10}>Last 10 hours</option>
                  <option value={24}>Last 24 hours</option>
                  <option value={168}>Last 7 days</option>
                </select>
              </label>
              <button
                onClick={() => fetchRobotHistory(historyHours)}
                disabled={historyLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: historyLoading ? '#d9d9d9' : '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: historyLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {historyLoading ? '🔄 Loading...' : '🔄 Refresh History'}
              </button>
            </div>
            
            {historyError && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#fff2f0', 
                border: '1px solid #ffccc7',
                borderRadius: '4px',
                color: '#ff4d4f',
                fontSize: '14px'
              }}>
                ❌ Error: {historyError}
              </div>
            )}
          </div>

          {/* History Data */}
          <div style={{ 
            padding: '20px', 
            border: '1px solid #d9d9d9', 
            borderRadius: '8px'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>
              📋 History Records ({historyData.length} entries)
            </h3>
            
            {historyLoading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#666'
              }}>
                🔄 Loading history data...
              </div>
            ) : historyData.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#666',
                fontStyle: 'italic'
              }}>
                📭 No history data available for the selected time range
              </div>
            ) : (
              <div style={{ 
                maxHeight: '500px', 
                overflowY: 'auto',
                border: '1px solid #f0f0f0',
                borderRadius: '4px'
              }}>
                {historyData.map((record, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '16px',
                      borderBottom: index < historyData.length - 1 ? '1px solid #f0f0f0' : 'none',
                      backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        color: '#262626'
                      }}>
                        {new Date(record.timestamp).toLocaleString()}
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: 
                          record.status === 'online' ? '#f6ffed' : 
                          record.status === 'offline' ? '#fff2f0' : '#fff7e6',
                        color:
                          record.status === 'online' ? '#52c41a' : 
                          record.status === 'offline' ? '#ff4d4f' : '#faad14'
                      }}>
                        {record.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                      gap: '12px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      <div>🔋 Battery: <strong>{record.battery}%</strong></div>
                      <div>🌡️ Temp: <strong>{record.temperature}°C</strong></div>
                      <div>💾 Memory: <strong>{record.memory}%</strong></div>
                      {record.location && (
                        <div>📍 Location: <strong>({record.location.x.toFixed(1)}, {record.location.y.toFixed(1)})</strong></div>
                      )}
                    </div>
                    
                    {(record.event || record.message) && (
                      <div style={{ 
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: '#595959'
                      }}>
                        {record.event && <div><strong>Event:</strong> {record.event}</div>}
                        {record.message && <div><strong>Message:</strong> {record.message}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}