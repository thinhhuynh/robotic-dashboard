import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@WebSocketGateway({
  namespace: '/dashboard',
  cors: {
    origin: '*',
  },
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(DashboardGateway.name);

  constructor(private readonly dashboardService: DashboardService) {}

  handleConnection(client: Socket) {
    this.logger.log('Dashboard client connected');
    client.join('/dashboard');
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Dashboard client disconnected');
  }

  @SubscribeMessage('getLatestStatuses')
  async handleGetLatestStatuses(@ConnectedSocket() client: Socket) {
    try {
      const data = await this.dashboardService.getLatestStatuses();
      client.emit('latestStatuses', data);
    } catch (error) {
      this.logger.error('Error getting latest statuses:', error);
      client.emit('error', { message: 'Failed to get latest statuses' });
    }
  }

  @SubscribeMessage('getRobotHistory')
  async handleGetRobotHistory(
    @MessageBody() payload: { robotId: string; hours?: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { robotId, hours } = payload;
      const data = await this.dashboardService.getRobotHistory(robotId, hours);
      client.emit('robotHistory', { robotId, data });
    } catch (error) {
      this.logger.error('Error getting robot history:', error);
      client.emit('error', { message: 'Failed to get robot history' });
    }
  }

  @SubscribeMessage('getAllRobots')
  async handleGetAllRobots(@ConnectedSocket() client: Socket) {
    try {
      const data = await this.dashboardService.getAllRobots();
      client.emit('allRobots', data);
    } catch (error) {
      this.logger.error('Error getting all robots:', error);
      client.emit('error', { message: 'Failed to get all robots' });
    }
  }
}