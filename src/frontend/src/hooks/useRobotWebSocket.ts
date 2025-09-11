import { useState, useEffect, useCallback } from 'react';

interface RobotUpdate {
  timestamp: string;
  type: 'update' | 'status' | 'full-data' | 'subscription' | 'command' | 'command-sent';
  data: any;
}

// WebSocket hook for robot channels - connects to robot:{robot_id} channel
export function useRobotWebSocket(robotId: string, enabled: boolean = true) {
  const [socket, setSocket] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [updates, setUpdates] = useState<RobotUpdate[]>([]);

  const addUpdate = useCallback((type: RobotUpdate['type'], data: any) => {
    setUpdates(prev => [
      {
        timestamp: new Date().toISOString(),
        type,
        data,
      },
      ...prev.slice(0, 9), // Keep only last 10 updates
    ]);
  }, []);

  useEffect(() => {
    if (!enabled || !robotId) return;

    useEffect(() => {
    if (!enabled || !robotId) return;

    const connectWebSocket = async () => {
      try {
        // Use Socket.IO client to connect to NestJS gateway
        const { io } = await import('socket.io-client');
        
        console.log(`🔌 Connecting to NestJS Robot Gateway for robot: ${robotId}`);
        setConnectionStatus('connecting');

        const newSocket = io('http://localhost:8080/robot', {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true,
          autoConnect: true,
        });

        newSocket.on('connect', () => {
          console.log('✅ Connected to NestJS Robot Gateway');
          console.log(`📡 Socket ID: ${newSocket.id}`);
          setConnectionStatus('connected');
          
          // Subscribe to specific robot channel
          const robotChannel = `robot:${robotId}`;
          newSocket.emit('subscribe', robotChannel);
          console.log(`� Subscribed to channel: ${robotChannel}`);
          
          // Request initial robot data
          newSocket.emit('get-robot-data', robotId);
        });

        newSocket.on('disconnect', () => {
          console.log('❌ Disconnected from NestJS Robot Gateway');
          setConnectionStatus('disconnected');
        });

        newSocket.on('connect_error', (error) => {
          console.error('❌ NestJS Gateway connection error:', error);
          setConnectionStatus('disconnected');
        });

        // Handle gateway events
        newSocket.on('connection', (data) => {
          console.log('📨 Gateway welcome message:', data);
          addUpdate('subscription', data);
        });

        newSocket.on('subscription-confirmed', (data) => {
          console.log('✅ Subscription confirmed:', data);
          addUpdate('subscription', data);
        });

        newSocket.on('command-confirmed', (data) => {
          console.log('🎮 Command confirmed:', data);
          addUpdate('command', data);
        });

        // Handle robot-specific events
        newSocket.on(`robot:${robotId}:update`, (data) => {
          console.log(`📊 Robot ${robotId} update:`, data);
          addUpdate('update', data);
        });

        newSocket.on(`robot:${robotId}:status`, (status) => {
          console.log(`📡 Robot ${robotId} status:`, status);
          addUpdate('status', { status });
        });

        newSocket.on(`robot:${robotId}:data`, (data) => {
          console.log(`📋 Robot ${robotId} data received:`, data);
          addUpdate('full-data', { message: 'Full robot data received' });
        });

        setSocket(newSocket);

      } catch (error) {
        console.error('Failed to connect to NestJS Gateway:', error);
        console.log('💡 Install socket.io-client: npm install socket.io-client');
        setConnectionStatus('disconnected');
      }
    };

    connectWebSocket();

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          newSocket.connected = true;
          setConnectionStatus('connected');
          
          // Subscribe to specific robot channel
          const robotChannel = `robot:${robotId}`;
          newSocket.emit('subscribe', robotChannel);
          console.log(`📡 Subscribed to channel: ${robotChannel}`);
          
          // Request initial robot data
          newSocket.emit('get-robot-data', robotId);
        };

        ws.onclose = () => {
          console.log('❌ WebSocket disconnected');
          newSocket.connected = false;
          setConnectionStatus('disconnected');
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket connection error:', error);
          setConnectionStatus('disconnected');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const { event: eventName, data } = message;
            
            // Trigger appropriate event listeners
            if (newSocket.eventListeners && newSocket.eventListeners.has(eventName)) {
              newSocket.eventListeners.get(eventName).forEach((callback: Function) => {
                callback(data);
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        newSocket.on('subscription-confirmed', (data) => {
          console.log('✅ Subscription confirmed:', data);
          addUpdate('subscription', data);
        });

        newSocket.on('command-confirmed', (data) => {
          console.log('🎮 Command confirmed:', data);
          addUpdate('command', data);
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('Failed to load socket.io-client:', error);
        setConnectionStatus('disconnected');
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        const robotChannel = `robot:${robotId}`;
        socket.emit('unsubscribe', robotChannel);
        console.log(`📡 Unsubscribed from channel: ${robotChannel}`);
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [enabled, robotId, addUpdate]);

  const sendCommand = useCallback((command: string, params?: any) => {
    if (socket && connectionStatus === 'connected') {
      const payload = {
        robotId,
        command,
        params,
        timestamp: new Date().toISOString(),
      };
      
      socket.emit('robot-command', payload);
      console.log(`📤 Sent command to robot ${robotId}:`, payload);
      
      addUpdate('command-sent', payload);
      return true;
    }
    console.warn('Socket.IO not connected, cannot send command');
    return false;
  }, [socket, connectionStatus, robotId, addUpdate]);

  const onRobotUpdate = useCallback((callback: (data: any) => void) => {
    if (socket) {
      const eventName = `robot:${robotId}:update`;
      socket.on(eventName, (data: any) => {
        console.log(`📊 Robot ${robotId} update:`, data);
        callback(data);
        addUpdate('update', data);
      });
      
      return () => socket.off(eventName);
    }
  }, [socket, robotId, addUpdate]);

  const onRobotStatus = useCallback((callback: (status: string) => void) => {
    if (socket) {
      const eventName = `robot:${robotId}:status`;
      socket.on(eventName, (status: string) => {
        console.log(`📡 Robot ${robotId} status changed to: ${status}`);
        callback(status);
        addUpdate('status', { status });
      });
      
      return () => socket.off(eventName);
    }
  }, [socket, robotId, addUpdate]);

  const onRobotData = useCallback((callback: (data: any) => void) => {
    if (socket) {
      const eventName = `robot:${robotId}:data`;
      socket.on(eventName, (data: any) => {
        console.log(`📋 Robot ${robotId} full data:`, data);
        callback(data);
        addUpdate('full-data', { message: 'Full robot data received' });
      });
      
      return () => socket.off(eventName);
    }
  }, [socket, robotId, addUpdate]);

  return {
    connectionStatus,
    updates,
    sendCommand,
    onRobotUpdate,
    onRobotStatus,
    onRobotData,
    isConnected: connectionStatus === 'connected',
  };
}