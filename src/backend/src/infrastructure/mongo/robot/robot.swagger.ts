import { ApiProperty } from '@nestjs/swagger';

export class RobotTelemetryResponse {
  @ApiProperty({ example: 'robot-001' }) id: string;
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { battery: 87 },
  })
  data: Record<string, any>;
  @ApiProperty({ format: 'date-time' }) createdAt: string;
  @ApiProperty({ format: 'date-time' }) updatedAt: string;
}

export class PaginatedRobotTelemetry {
  @ApiProperty({ type: [RobotTelemetryResponse] })
  items: RobotTelemetryResponse[];
  @ApiProperty({ example: 1 }) total: number;
  @ApiProperty({ example: 0 }) offset: number;
  @ApiProperty({ example: 20 }) limit: number;
}
