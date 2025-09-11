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

  await app.listen(PORT, () =>
    console.log(`Application running on port ${PORT}`),
  );
}
bootstrap();
