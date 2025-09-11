import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

class DatabaseCleaner {
  async clean() {
    console.log('🧹 Starting database cleanup...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    
    try {
      const connection = app.get(Connection);
      
      // Drop the robot_telemetry collection
      const collections = await connection.db.listCollections().toArray();
      const robotCollection = collections.find(col => col.name === 'robot_telemetry');
      
      if (robotCollection) {
        await connection.db.collection('robot_telemetry').drop();
        console.log('✅ Dropped robot_telemetry collection');
      } else {
        console.log('ℹ️  robot_telemetry collection does not exist');
      }
      
      console.log('✅ Database cleanup completed successfully!');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('ℹ️  Collection already empty or does not exist');
      } else {
        console.error('❌ Database cleanup failed:', error);
      }
    } finally {
      await app.close();
    }
  }
}

// Run the cleaner
async function runCleaner() {
  const cleaner = new DatabaseCleaner();
  await cleaner.clean();
  process.exit(0);
}

runCleaner().catch(error => {
  console.error('Failed to run database cleaner:', error);
  process.exit(1);
});