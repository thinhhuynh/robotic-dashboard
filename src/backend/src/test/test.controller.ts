import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get('cors')
  testCors() {
    return {
      message: 'CORS is working!',
      timestamp: new Date().toISOString(),
      origin: 'Backend API'
    };
  }
}