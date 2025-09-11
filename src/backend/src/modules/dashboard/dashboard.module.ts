import { Module } from '@nestjs/common';
import { DashboardGateway } from './dashboard.gateway';
import { DashboardService } from './dashboard.service';
import { RobotModule } from '../robot/robot.module';

@Module({
  imports: [RobotModule],
  providers: [DashboardGateway, DashboardService],
})
export class DashboardModule {}