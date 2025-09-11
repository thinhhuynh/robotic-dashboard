import dotenv from 'dotenv';
import path from 'path';

// load env
const envFile = process.env.ENV ? `.env.${process.env.ENV.trim()}` : '.env';
const PORT = process.env.PORT || 8080;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

import { SocketIoAdapter } from 'src/infrastructure/socket/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000', 
    'http://127.0.0.1:3000'
  ];
  
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // global prefix
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI, // Or VersioningType.HEADER
    prefix: 'v1', // Optional: prefix for URI versioning (e.g., /v1, /v2)
  });

  

  // documentation
  const configDocument = new DocumentBuilder()
    .setTitle('NestJS template for Robot-Dashboard')
    .setDescription('API description')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, configDocument);
  SwaggerModule.setup('api/v1/docs', app, document);

  app.useWebSocketAdapter(new SocketIoAdapter(app));

  await app.listen(PORT, () => {
    console.log(`🚀 Application running on port ${PORT}`);
    console.log(`📡 REST API: http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api/v1/docs`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/socket.io`);
    console.log(`💡 Test WebSocket: Open browser console and connect to ws://localhost:${PORT}`);
  });
}
bootstrap();
