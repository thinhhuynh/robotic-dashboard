import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { RobotModule } from './modules/robot/robot.module';
import { RobotGateway } from './infrastructure/socket/gateways/robot.gateway';
import { DashboardGateway } from './infrastructure/socket/gateways/dashboard.gateway';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    RobotModule,
  ],
  providers: [RobotGateway, DashboardGateway],
})
export class AppModule {}
