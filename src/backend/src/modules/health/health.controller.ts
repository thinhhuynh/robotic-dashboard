import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { API_PREFIX } from '../constant';

@Controller({ path: `${API_PREFIX}/health` })
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async checkHealth() {
    const dbStatus = await this.databaseService.getConnectionStatus();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
    };
  }

  @Get('db')
  async checkDatabase() {
    const dbStatus = await this.databaseService.getConnectionStatus();
    return {
      database: dbStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}