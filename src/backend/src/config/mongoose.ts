import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const mongooseConfig: MongooseModuleFactoryOptions = {
  uri: process.env.MONGODB_URI!,
};
