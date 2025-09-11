import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { RobotService } from './robot.service';
import { CreateRobotDataDto } from '../../common/dto/robot-data.dto';
import { Robot } from '../../database/schemas/robot.schema';

export class CreateRobotRequest extends CreateRobotDataDto {
  robotId: string;
}

export class UpdateRobotRequest extends CreateRobotDataDto {}

export class QueryRobotRequest {
  offset?: number;
  limit?: number;
}

import { API_PREFIX } from '../constant';

@Controller(`${API_PREFIX}/robots`)
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  @Post()
  create(@Body() dto: CreateRobotRequest) {
    return this.robotService.create(dto);
  }

  @Post('upsert')
  upsert(@Body() dto: CreateRobotRequest) {
    return this.robotService.upsert(dto);
  }

  @Get()
  findAll(@Query() query: QueryRobotRequest) {
    return this.robotService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Robot> {
    return this.robotService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateRobotRequest) {
    return this.robotService.updateByIdParam(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ deleted: boolean; deletedCount: number }> {
    return this.robotService.remove(id);
  }

  @Get('latest/statuses')
  getLatestStatuses() {
    return this.robotService.getLatestStatuses();
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string, @Query('hours') hours?: string) {
    const hoursNum = hours ? parseInt(hours) : 6;
    return this.robotService.getHistory(id, hoursNum);
  }
}
