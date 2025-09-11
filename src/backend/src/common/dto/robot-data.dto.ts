import { 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsOptional, 
  IsEnum, 
  Min, 
  Max,
  ValidateNested,
  IsDate,
  IsUUID
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;
}

class ErrorDto {
  @IsString()
  code: string;

  @IsString()
  message: string;

  @IsDate()
  @Type(() => Date)
  timestamp: Date;
}

export class CreateRobotDataDto {
  @IsOptional()
  @IsUUID(4)
  robotId?: string;

  @IsEnum(['online', 'offline', 'maintenance'])
  status: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  battery: number;

  @IsNumber()
  @Min(-100)
  @Max(0)
  wifiStrength: number;

  @IsBoolean()
  charging: boolean;

  @IsNumber()
  @Min(-50)
  @Max(150)
  temperature: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  memory: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ErrorDto)
  lastError?: ErrorDto;
}