// infrastructure/mongo/robot/dto/update-robot-telemetry.dto.ts
import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRobotRequest {
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { battery: 90 },
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
