import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RobotModule } from './modules/robot/robot.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RobotModule,
    DashboardModule,
  ],
})
export class AppModule {}