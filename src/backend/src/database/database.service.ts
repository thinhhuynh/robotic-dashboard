import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected successfully');
    });

    this.connection.on('error', (error) => {
      this.logger.error('MongoDB connection error:', error);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });

    // Test the connection
    try {
      await this.connection.db.admin().ping();
      this.logger.log('MongoDB ping successful');
    } catch (error) {
      this.logger.error('MongoDB ping failed:', error.message);
      if (error.message.includes('authentication')) {
        this.logger.error('Authentication failed. Please check your MongoDB credentials in .env file');
      }
    }
  }

  async getConnectionStatus(): Promise<boolean> {
    try {
      await this.connection.db.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}