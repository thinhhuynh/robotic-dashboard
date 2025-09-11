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

    const connectWebSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        
        console.log(`🔌 Connecting to WebSocket for robot: ${robotId}`);
        setConnectionStatus('connecting');

        // Connect directly to standalone WebSocket server (no Socket.IO suffix)
        const wsUrl = `http://localhost:8080/socket.io`;
        console.log(`🔌 Connecting to Robot WebSocket: ${wsUrl}`);
        
        const ws = new WebSocket(wsUrl);
        const newSocket = {
          connected: false,
          id: Math.random().toString(36).substr(2, 9),
          ws: ws,
          emit: (event: string, data?: any) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ event, data }));
            }
          },
          on: (event: string, callback: Function) => {
            // Store event listeners for message handling
            if (!newSocket.eventListeners) newSocket.eventListeners = new Map();
            if (!newSocket.eventListeners.has(event)) {
              newSocket.eventListeners.set(event, []);
            }
            newSocket.eventListeners.get(event).push(callback);
          },
          disconnect: () => {
            ws.close();
          },
          eventListeners: new Map()
        };

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
    console.warn('WebSocket not connected, cannot send command');
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