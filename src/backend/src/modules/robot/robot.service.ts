import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
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
    const saved = await robotData.save();
    // this.events.emit('telemetry.updated', { robotId, data: saved });
    return saved;
  }

  async create(data: CreateRobotDataDto & { robotId?: string }): Promise<Robot> {
    const robotId = data.robotId || uuidv4();
    return this.saveRobotData(robotId, data);
  }

  async upsert(data: CreateRobotDataDto & { robotId?: string }): Promise<Robot> {
    const robotId = data.robotId || uuidv4();
    return this.robotModel.findOneAndUpdate(
      { robotId },
      { $set: { ...data, robotId } },
      { upsert: true, new: true },
    );
  }

  async findAll(query: any = {}): Promise<{ items: Robot[]; total: number; offset: number; limit: number }> {
    const { offset = 0, limit = 20 } = query;
    const [items, total] = await Promise.all([
      this.robotModel.find().skip(offset).limit(limit).lean(),
      this.robotModel.countDocuments(),
    ]);
    return { items, total, offset, limit };
  }

  async updateByIdParam(robotId: string, body: CreateRobotDataDto): Promise<Robot> {
    const doc = await this.robotModel.findOneAndUpdate(
      { robotId },
      { $set: body },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Robot not found');
    return doc;
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

  async findOne(robotId: string): Promise<Robot> {
    const robot = await this.robotModel.findOne({ robotId }).lean();
    if (!robot) throw new NotFoundException('Robot not found');
    return robot;
  }

  async remove(robotId: string) {
    const result = await this.robotModel.deleteMany({ robotId });
    if (result.deletedCount === 0) throw new NotFoundException('Robot not found');
    return { deleted: true, deletedCount: result.deletedCount };
  }
}
