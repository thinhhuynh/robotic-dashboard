import { Injectable } from '@nestjs/common';
import { RobotService } from '../robot/robot.service';

@Injectable()
export class DashboardService {
  constructor(private readonly robotService: RobotService) {}

  async getLatestStatuses() {
    return this.robotService.getLatestStatuses();
  }

  async getRobotHistory(robotId: string, hours = 6) {
    return this.robotService.getHistory(robotId, hours);
  }

  async getAllRobots() {
    return this.robotService.getAllRobots();
  }
}