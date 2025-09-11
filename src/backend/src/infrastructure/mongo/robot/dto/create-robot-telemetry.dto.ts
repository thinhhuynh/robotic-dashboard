// infrastructure/mongo/robot/dto/create-robot-telemetry.dto.ts
import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRobotRequest {
  @ApiProperty({ example: 'robot-001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { battery: 87, temp: 36.5, status: 'OK' },
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;
}
