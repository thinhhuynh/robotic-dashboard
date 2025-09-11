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
import { ConfigService } from '@nestjs/config';
import { RobotService } from './robot.service';
import { CreateRobotDataDto } from '../../common/dto/robot-data.dto';

@WebSocketGateway({
  namespace: '/robots',
  cors: {
    origin: '*',
  },
})
export class RobotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(RobotGateway.name);

  constructor(
    private readonly robotService: RobotService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    const robotId = client.handshake.query.robotId as string;
    if (robotId) {
      client.data.robotId = robotId;
      this.logger.log(`Robot ${robotId} connected`);
    } else {
      this.logger.warn('Robot connected without robotId');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const robotId = client.data.robotId;
    if (robotId) {
      this.logger.log(`Robot ${robotId} disconnected`);
    }
  }

  @SubscribeMessage('robotData')
  async handleRobotData(
    @MessageBody() data: CreateRobotDataDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const robotId = client.data.robotId;
      if (!robotId) {
        throw new Error('Robot ID not found');
      }

      this.logger.debug(`Received data from ${robotId}:`, data);
      
      // Save to database
      const savedData = await this.robotService.saveRobotData(robotId, data);
      
      // Broadcast to dashboard clients
      this.server.to('/dashboard').emit('robotUpdate', {
        robotId,
        ...savedData.toObject(),
      });
      
      return { success: true };
    } catch (error) {
      this.logger.error('Error processing robot data:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const robotId = client.data.robotId;
    this.logger.debug(`Ping from robot ${robotId}`);
    return { pong: Date.now() };
  }
}