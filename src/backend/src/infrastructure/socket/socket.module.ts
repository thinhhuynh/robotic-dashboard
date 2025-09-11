import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RobotGateway } from './gateways/robot.gateway';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [RobotGateway],
  exports: [EventEmitterModule],
})
export class SocketModule {}
