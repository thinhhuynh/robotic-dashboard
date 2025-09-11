import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Robot, RobotSchema } from '../../database/schemas/robot.schema';
import { RobotGateway } from './robot.gateway';
import { RobotService } from './robot.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Robot.name, schema: RobotSchema }]),
  ],
  providers: [RobotGateway, RobotService],
  exports: [RobotService],
})
export class RobotModule {}