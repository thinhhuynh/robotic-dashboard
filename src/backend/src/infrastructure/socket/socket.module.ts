import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RobotTelemetryGateway } from './gateways/robot-telemetry.gateway';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [RobotTelemetryGateway],
  exports: [EventEmitterModule],
})
export class SocketModule {}
