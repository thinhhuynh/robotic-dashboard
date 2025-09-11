import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Robot, RobotSchema } from '../../database/schemas/robot.schema';
import { RobotController } from './robot.controller';
import { RobotService } from './robot.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Robot.name, schema: RobotSchema }]),
  ],
  controllers: [RobotController],
  providers: [RobotService],
  exports: [RobotService],
})
export class RobotModule {}
