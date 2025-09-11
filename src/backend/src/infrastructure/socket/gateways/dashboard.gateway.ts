import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  namespace: 'dashboard',
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class DashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Dashboard WebSocket client connected: ${client.id}`);
    console.log(`📡 Client transport: ${client.conn.transport.name}`);
    console.log(`📍 Client IP: ${client.handshake.address}`);
    
    // Send welcome message
    client.emit('connection', {
      message: 'Connected to Dashboard Gateway',
      clientId: client.id,
      namespace: '/dashboard',
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Dashboard WebSocket client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  onSubscribe(
    @MessageBody() channel: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`📡 Dashboard client ${client.id} subscribing to: ${channel}`);
    
    // Join the dashboard channel
    client.join(channel);
    
    // Send confirmation
    client.emit('subscription-confirmed', {
      channel,
      message: `Subscribed to ${channel}`,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`✅ Dashboard client ${client.id} joined channel: ${channel}`);
    return { success: true, channel };
  }

  @SubscribeMessage('unsubscribe')
  onUnsubscribe(
    @MessageBody() channel: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`📡 Dashboard client ${client.id} unsubscribing from: ${channel}`);
    client.leave(channel);
    
    client.emit('unsubscription-confirmed', {
      channel,
      message: `Unsubscribed from ${channel}`,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true, channel };
  }

  @SubscribeMessage('get-fleet-status')
  onGetFleetStatus(
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`📊 Dashboard client ${client.id} requesting fleet status`);
    
    // Generate mock fleet statistics
    const fleetStatus = this.generateFleetStatistics();
    
    // Send fleet status
    client.emit('fleet-statistics', fleetStatus);
    
    console.log(`📤 Sent fleet status to dashboard client ${client.id}`);
    return { success: true, type: 'fleet-status' };
  }

  @SubscribeMessage('refresh-dashboard')
  onRefreshDashboard(
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`🔄 Dashboard client ${client.id} requesting dashboard refresh`);
    
    // Broadcast dashboard update
    this.broadcastDashboardUpdate({
      type: 'dashboard-refresh',
      source: 'manual',
      timestamp: new Date().toISOString(),
    });
    
    return { success: true, type: 'dashboard-refresh' };
  }

  // Helper method to generate mock fleet statistics
  private generateFleetStatistics() {
    const totalRobots = Math.floor(Math.random() * 200) + 100;
    const onlineRobots = Math.floor(totalRobots * (0.7 + Math.random() * 0.2));
    const chargingRobots = Math.floor(totalRobots * (0.1 + Math.random() * 0.1));
    const maintenanceRobots = Math.floor(totalRobots * (0.05 + Math.random() * 0.05));
    const offlineRobots = totalRobots - onlineRobots - chargingRobots - maintenanceRobots;

    return {
      total: totalRobots,
      online: onlineRobots,
      offline: offlineRobots,
      charging: chargingRobots,
      maintenance: maintenanceRobots,
      averageBattery: Math.floor(Math.random() * 40) + 60,
      averageTemperature: Math.floor(Math.random() * 10) + 20,
      activeAlerts: Math.floor(Math.random() * 5),
      timestamp: new Date().toISOString(),
    };
  }

  // Helper method to broadcast dashboard updates
  public broadcastDashboardUpdate(data: any) {
    console.log('📡 Broadcasting dashboard update:', data);
    this.server.to('dashboard-updates').emit('dashboard-update', data);
  }

  // Helper method to broadcast robot status changes
  public broadcastRobotStatusChange(robotId: string, updates: any) {
    console.log(`🤖 Broadcasting robot status change for ${robotId}:`, updates);
    this.server.to('dashboard-updates').emit('robot-status-change', {
      robotId,
      updates,
      timestamp: new Date().toISOString(),
    });
  }

  // Periodic fleet statistics broadcast (every 30 seconds)
  public startPeriodicUpdates() {
    setInterval(() => {
      const fleetStats = this.generateFleetStatistics();
      console.log('📈 Broadcasting periodic fleet statistics');
      this.server.to('dashboard-updates').emit('fleet-statistics', fleetStats);
    }, 30000);
  }

  @OnEvent('robot.updated')
  onRobotUpdated(payload: { id: string; data: any }) {
    this.broadcastRobotStatusChange(payload.id, payload.data);
  }

  @OnEvent('fleet.updated')
  onFleetUpdated(payload: { type: string; data: any }) {
    this.broadcastDashboardUpdate(payload);
  }
}