import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplicationContext } from '@nestjs/common';

export class SocketIoAdapter extends IoAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }
  createIOServer(port: number, options?: any) {
    const cors = {
      origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
      credentials: true,
    };
    const path = process.env.SOCKET_PATH || '/socket.io';
    return super.createIOServer(port, { cors, path, ...options });
  }
}
