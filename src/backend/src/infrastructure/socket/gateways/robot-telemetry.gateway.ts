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
  // 👇 use name without leading slash (Nest will mount it at "/robot")
  namespace: 'robot',
  cors: { origin: '*', credentials: true },
})
export class RobotTelemetryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  handleConnection(c: Socket) {
    console.log('WS connected:', c.id);
  }
  handleDisconnect(c: Socket) {
    console.log('WS disconnected:', c.id);
  }

  @SubscribeMessage('subscribe')
  onSubscribe(
    @MessageBody() body: { id: string },
    @ConnectedSocket() c: Socket,
  ) {
    c.join(body.id);
    return { ok: true, room: body.id };
  }

  @OnEvent('telemetry.updated')
  onTelemetryUpdated(payload: { id: string; data: any }) {
    this.server.to(payload.id).emit('telemetry', payload);
  }
}
