import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'robotic-dashboard-backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      websockets: {
        robot: {
          namespace: '/',
          endpoint: 'http://localhost:8080',
          description: 'Individual robot control and monitoring'
        },
        dashboard: {
          namespace: '/dashboard',
          endpoint: 'ws://localhost:8080/dashboard',
          description: 'Fleet dashboard real-time updates'
        }
      }
    };
  }

  @Get('check')
  getHealthCheck() {
    return { status: 'healthy' };
  }
}