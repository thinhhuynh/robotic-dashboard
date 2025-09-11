// infrastructure/mongo.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { mongooseConfig } from 'src/config/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (): Promise<MongooseModuleFactoryOptions> =>
        mongooseConfig as MongooseModuleFactoryOptions,
    }),
  ],
})
export class MongoModule {}
