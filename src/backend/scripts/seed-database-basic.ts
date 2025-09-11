import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RobotService } from '../src/modules/robot/robot.service';
import { v4 as uuidv4 } from 'uuid';

interface SeedRobotData {
  robotId: string;
  status: 'online' | 'offline' | 'maintenance';
  battery: number;
  wifiStrength: number;
  charging: boolean;
  temperature: number;
  memory: number;
  location: {
    x: number;
    y: number;
    z: number;
  };
  lastError?: {
    code: string;
    message: string;
    timestamp: Date;
  };
}

export class DatabaseSeeder {
  private robotService: RobotService;

  async seed() {
    console.log('🌱 Starting basic database seeding...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    this.robotService = app.get(RobotService);

    try {
      await this.seedRobots();
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
    } finally {
      await app.close();
    }
  }

  private async seedRobots() {
    console.log('🤖 Seeding 200 robot records...');
    
    const robots: SeedRobotData[] = [];
    const statuses: Array<'online' | 'offline' | 'maintenance'> = ['online', 'offline', 'maintenance'];
    const errorCodes = ['ERR_001', 'ERR_002', 'ERR_003', 'TEMP_HIGH', 'BATTERY_LOW', 'WIFI_WEAK'];
    const errorMessages = [
      'Sensor malfunction detected',
      'Communication timeout',
      'Battery level critical',
      'Temperature threshold exceeded',
      'Memory usage high',
      'WiFi signal weak'
    ];

    // Generate 200 robot records
    for (let i = 1; i <= 200; i++) {
      const hasError = Math.random() < 0.15; // 15% chance of having an error
      const isCharging = Math.random() < 0.3; // 30% chance of charging
      const batteryLevel = isCharging ? 
        Math.floor(Math.random() * 40) + 60 : // 60-100% if charging
        Math.floor(Math.random() * 101); // 0-100% if not charging

      const robot: SeedRobotData = {
        robotId: uuidv4(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        battery: batteryLevel,
        wifiStrength: Math.floor(Math.random() * 71) - 100, // -100 to -30
        charging: isCharging,
        temperature: Math.floor(Math.random() * 80) - 10, // -10 to 70 Celsius
        memory: Math.floor(Math.random() * 101), // 0-100%
        location: {
          x: Math.round((Math.random() * 1000) * 100) / 100, // 0-1000 with 2 decimals
          y: Math.round((Math.random() * 1000) * 100) / 100,
          z: Math.round((Math.random() * 50) * 100) / 100, // 0-50 for height
        },
      };

      // Add error information for some robots
      if (hasError) {
        const errorIndex = Math.floor(Math.random() * errorCodes.length);
        robot.lastError = {
          code: errorCodes[errorIndex],
          message: errorMessages[errorIndex],
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        };
      }

      robots.push(robot);
    }

    // Insert robots in batches to avoid overwhelming the database
    const batchSize = 20;
    let processed = 0;

    for (let i = 0; i < robots.length; i += batchSize) {
      const batch = robots.slice(i, i + batchSize);
      
      // Create promises for the batch
      const promises = batch.map(robot => 
        this.robotService.create(robot)
      );

      try {
        await Promise.all(promises);
        processed += batch.length;
        console.log(`✅ Processed ${processed}/${robots.length} robots`);
      } catch (error) {
        console.error(`❌ Error processing batch starting at index ${i}:`, error);
      }

      // Small delay between batches to be gentle on the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🎉 Successfully seeded 200 robot records!');
  }
}