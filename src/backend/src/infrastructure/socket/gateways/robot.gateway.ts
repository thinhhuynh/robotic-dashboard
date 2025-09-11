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
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class RobotGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 WebSocket client connected: ${client.id}`);
    console.log(`📡 Client transport: ${client.conn.transport.name}`);
    console.log(`📍 Client IP: ${client.handshake.address}`);
    
    // Send welcome message
    client.emit('connection', {
      message: 'Connected to Robot Gateway',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ WebSocket client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  onSubscribe(
    @MessageBody() channel: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`📡 Client ${client.id} subscribing to: ${channel}`);
    
    // Join the robot channel
    client.join(channel);
    
    // Send confirmation
    client.emit('subscription-confirmed', {
      channel,
      message: `Subscribed to ${channel}`,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`✅ Client ${client.id} joined channel: ${channel}`);
    return { success: true, channel };
  }

  @SubscribeMessage('unsubscribe')
  onUnsubscribe(
    @MessageBody() channel: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`📡 Client ${client.id} unsubscribing from: ${channel}`);
    client.leave(channel);
    
    client.emit('unsubscription-confirmed', {
      channel,
      message: `Unsubscribed from ${channel}`,
      timestamp: new Date().toISOString(),
    });
    
    return { success: true, channel };
  }

  @SubscribeMessage('get-robot-data')
  onGetRobotData(
    @MessageBody() robotId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`📊 Client ${client.id} requesting data for robot: ${robotId}`);
    
    // Generate mock robot data
    const robotData = this.generateMockRobotData(robotId);
    
    // Send robot data
    client.emit(`robot:${robotId}:data`, robotData);
    
    console.log(`📤 Sent robot data for ${robotId} to client ${client.id}`);
    return { success: true, robotId };
  }

  @SubscribeMessage('robot-command')
  onRobotCommand(
    @MessageBody() payload: { robotId: string; command: string; params?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { robotId, command, params } = payload;
    console.log(`🎮 Client ${client.id} sent command '${command}' to robot ${robotId}`);
    
    // Confirm command received
    client.emit('command-confirmed', {
      robotId,
      command,
      params,
      status: 'executed',
      timestamp: new Date().toISOString(),
    });
    
    // Process command and broadcast updates
    this.processRobotCommand(robotId, command, params);
    
    return { success: true, robotId, command };
  }

  // Helper method to generate mock robot data
  private generateMockRobotData(robotId: string) {
    return {
      _id: robotId,
      robotId: robotId,
      status: ['online', 'offline', 'maintenance'][Math.floor(Math.random() * 3)],
      battery: Math.floor(Math.random() * 100),
      temperature: Math.floor(Math.random() * 30) + 15,
      memory: Math.floor(Math.random() * 100),
      wifiStrength: Math.floor(Math.random() * 50) - 80,
      charging: Math.random() > 0.7,
      location: {
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 10,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Helper method to process robot commands
  private processRobotCommand(robotId: string, command: string, params?: any) {
    const channel = `robot:${robotId}`;
    
    switch (command) {
      case 'start':
        this.server.to(channel).emit(`robot:${robotId}:status`, 'online');
        this.server.to(channel).emit(`robot:${robotId}:update`, {
          status: 'online',
          timestamp: new Date().toISOString(),
        });
        break;
      case 'stop':
        this.server.to(channel).emit(`robot:${robotId}:status`, 'offline');
        this.server.to(channel).emit(`robot:${robotId}:update`, {
          status: 'offline',
          timestamp: new Date().toISOString(),
        });
        break;
      case 'maintenance':
        this.server.to(channel).emit(`robot:${robotId}:status`, 'maintenance');
        this.server.to(channel).emit(`robot:${robotId}:update`, {
          status: 'maintenance',
          timestamp: new Date().toISOString(),
        });
        break;
      case 'refresh':
        const robotData = this.generateMockRobotData(robotId);
        this.server.to(channel).emit(`robot:${robotId}:data`, robotData);
        break;
      default:
        console.warn(`Unknown command: ${command} for robot ${robotId}`);
    }
  }

  @OnEvent('robot.updated')
  onRobotUpdated(payload: { id: string; data: any }) {
    this.server.to(payload.id).emit('robot:update', payload);
  }
}
