// WebSocket utility for robot channels with dynamic import
export class RobotWebSocketManager {
  private socket: any = null;
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' = 'disconnected';
  private updates: any[] = [];
  private callbacks: Map<string, Function[]> = new Map();

  constructor(private robotId: string) {}

  async connect(): Promise<boolean> {
    try {
      console.log(`🔌 Connecting to Socket.IO for robot: ${this.robotId}`);
      this.connectionStatus = 'connecting';
      this.notifyStatusCallbacks();

      // Use Socket.IO client to connect to NestJS gateway
      const { io } = await import('socket.io-client');
      
      const socket = io('http://localhost:8080', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
      });

      this.socket = socket;

      socket.on('connect', () => {
        console.log('✅ Socket.IO connected');
        console.log(`📡 Socket ID: ${socket.id}`);
        this.connectionStatus = 'connected';
        this.notifyStatusCallbacks();
        
        // Subscribe to robot channel
        const robotChannel = `robot:${this.robotId}`;
        socket.emit('subscribe', robotChannel);
        console.log(`📡 Subscribed to channel: ${robotChannel}`);
        
        // Request initial data
        socket.emit('get-robot-data', this.robotId);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket.IO disconnected');
        this.connectionStatus = 'disconnected';
        this.notifyStatusCallbacks();
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
        this.connectionStatus = 'disconnected';
        this.notifyStatusCallbacks();
      });

      // Handle gateway welcome message
      socket.on('connection', (data) => {
        console.log('📨 Gateway welcome message:', data);
        this.addUpdate('subscription', data);
      });

      // Set up robot-specific event listeners
      this.setupRobotEventListeners();

      return true;
    } catch (error) {
      console.error('Failed to connect to Socket.IO:', error);
      console.log('💡 Install socket.io-client: npm install socket.io-client');
      this.connectionStatus = 'disconnected';
      this.notifyStatusCallbacks();
      return false;
    }
  }

  private setupRobotEventListeners() {
    if (!this.socket) return;

    // Robot data events
    this.socket.on(`robot:${this.robotId}:update`, (data: any) => {
      console.log(`📊 Robot ${this.robotId} update:`, data);
      this.addUpdate('update', data);
      this.notifyCallbacks('update', data);
    });

    this.socket.on(`robot:${this.robotId}:status`, (status: string) => {
      console.log(`📡 Robot ${this.robotId} status: ${status}`);
      this.addUpdate('status', { status });
      this.notifyCallbacks('status', status);
    });

    this.socket.on(`robot:${this.robotId}:data`, (data: any) => {
      console.log(`📋 Robot ${this.robotId} full data received`);
      this.addUpdate('full-data', { message: 'Full robot data received' });
      this.notifyCallbacks('data', data);
    });

    // System events
    this.socket.on('subscription-confirmed', (data: any) => {
      console.log('✅ Subscription confirmed:', data);
      this.addUpdate('subscription', data);
    });

    this.socket.on('command-confirmed', (data: any) => {
      console.log('🎮 Command confirmed:', data);
      this.addUpdate('command', data);
    });
  }

  sendCommand(command: string, params?: any): boolean {
    if (this.socket && this.connectionStatus === 'connected') {
      const payload = {
        robotId: this.robotId,
        command,
        params,
        timestamp: new Date().toISOString(),
      };
      
      this.socket.emit('robot-command', payload);
      console.log(`📤 Sent command to robot ${this.robotId}:`, payload);
      
      this.addUpdate('command-sent', payload);
      return true;
    }
    
    console.warn('WebSocket not connected, cannot send command');
    return false;
  }

  onStatusChange(callback: (status: string) => void) {
    this.addCallback('statusChange', callback);
  }

  onUpdate(callback: (data: any) => void) {
    this.addCallback('update', callback);
  }

  onStatus(callback: (status: string) => void) {
    this.addCallback('status', callback);
  }

  onData(callback: (data: any) => void) {
    this.addCallback('data', callback);
  }

  onUpdatesChange(callback: (updates: any[]) => void) {
    this.addCallback('updatesChange', callback);
  }

  private addCallback(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  private notifyCallbacks(event: string, data?: any) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  private notifyStatusCallbacks() {
    this.notifyCallbacks('statusChange', this.connectionStatus);
  }

  private addUpdate(type: string, data: any) {
    const update = {
      timestamp: new Date().toISOString(),
      type,
      data,
    };
    
    this.updates = [update, ...this.updates.slice(0, 9)]; // Keep last 10
    this.notifyCallbacks('updatesChange', this.updates);
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  getUpdates() {
    return this.updates;
  }

  disconnect() {
    if (this.socket) {
      const robotChannel = `robot:${this.robotId}`;
      this.socket.emit('unsubscribe', robotChannel);
      console.log(`📡 Unsubscribed from channel: ${robotChannel}`);
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus = 'disconnected';
    this.callbacks.clear();
  }
}