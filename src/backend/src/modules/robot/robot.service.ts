import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Robot, RobotDocument } from '../../database/schemas/robot.schema';
import { CreateRobotDataDto } from '../../common/dto/robot-data.dto';

@Injectable()
export class RobotService {
  constructor(
    @InjectModel(Robot.name) private robotModel: Model<RobotDocument>,
  ) {}

  async saveRobotData(robotId: string, data: CreateRobotDataDto): Promise<Robot> {
    const robotData = new this.robotModel({
      robotId,
      ...data,
      timestamp: new Date(),
    });
    return robotData.save();
  }

  async getLatestStatuses(): Promise<Robot[]> {
    return (this.robotModel as any).getLatestStatuses();
  }

  async getHistory(robotId: string, hours = 6): Promise<Robot[]> {
    return (this.robotModel as any).getHistory(robotId, hours);
  }

  async findByRobotId(robotId: string): Promise<Robot[]> {
    return this.robotModel.find({ robotId }).sort({ timestamp: -1 }).exec();
  }

  async getAllRobots(): Promise<Robot[]> {
    return this.robotModel.find().sort({ timestamp: -1 }).exec();
  }
}