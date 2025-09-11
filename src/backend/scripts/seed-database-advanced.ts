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

class AdvancedDatabaseSeeder {
  private robotService: RobotService;

  async seed() {
    console.log('🌱 Starting advanced database seeding with historical data...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    this.robotService = app.get(RobotService);

    try {
      await this.seedRobotsWithHistory();
      console.log('✅ Advanced database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
    } finally {
      await app.close();
    }
  }

  private async seedRobotsWithHistory() {
    console.log('🤖 Seeding 200 robots with historical data...');
    
    const robotIds: string[] = [];
    const statuses: Array<'online' | 'offline' | 'maintenance'> = ['online', 'offline', 'maintenance'];
    
    // Generate unique robot IDs first
    for (let i = 1; i <= 200; i++) {
      robotIds.push(uuidv4());
    }

    console.log('📊 Creating historical data for the past 7 days...');
    
    // Create historical data for the past 7 days
    for (let day = 6; day >= 0; day--) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - day);
      
      console.log(`📅 Processing day ${7 - day}/7: ${dayDate.toDateString()}`);
      
      // Create 4 data points per day for each robot (every 6 hours)
      for (let hour = 0; hour < 24; hour += 6) {
        const batch: SeedRobotData[] = [];
        
        for (const robotId of robotIds) {
          const timestamp = new Date(dayDate);
          timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          
          const robot = this.generateRobotData(robotId, timestamp);
          batch.push(robot);
        }
        
        // Insert batch
        await this.insertBatch(batch, `Day ${7 - day}, Hour ${hour}`);
        
        // Small delay to not overwhelm the database
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log('🎉 Successfully seeded 200 robots with 7 days of historical data!');
    console.log(`📈 Total records created: ${200 * 7 * 4} = 5,600 records`);
  }

  private generateRobotData(robotId: string, timestamp: Date): SeedRobotData {
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

    const hasError = Math.random() < 0.1; // 10% chance of error
    const isCharging = Math.random() < 0.25; // 25% chance of charging
    
    // Simulate battery drain/charge cycles
    const hourOfDay = timestamp.getHours();
    let batteryBase = 50;
    
    // Higher battery during charging hours (night time)
    if (hourOfDay >= 22 || hourOfDay <= 6) {
      batteryBase = isCharging ? 85 : 60;
    } else {
      batteryBase = isCharging ? 70 : Math.max(20, 80 - (hourOfDay - 6) * 3);
    }
    
    const batteryVariation = Math.floor(Math.random() * 30) - 15; // ±15%
    const battery = Math.max(0, Math.min(100, batteryBase + batteryVariation));

    const robot: SeedRobotData = {
      robotId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      battery,
      wifiStrength: Math.floor(Math.random() * 71) - 100, // -100 to -30
      charging: isCharging,
      temperature: Math.floor(Math.random() * 60) + 10, // 10-70°C
      memory: Math.floor(Math.random() * 101), // 0-100%
      location: {
        x: Math.round((Math.random() * 1000) * 100) / 100,
        y: Math.round((Math.random() * 1000) * 100) / 100,
        z: Math.round((Math.random() * 50) * 100) / 100,
      },
    };

    // Add error information
    if (hasError) {
      const errorIndex = Math.floor(Math.random() * errorCodes.length);
      robot.lastError = {
        code: errorCodes[errorIndex],
        message: errorMessages[errorIndex],
        timestamp: new Date(timestamp.getTime() - Math.random() * 60 * 60 * 1000), // Error within last hour
      };
    }

    return robot;
  }

  private async insertBatch(robots: SeedRobotData[], batchName: string) {
    const batchSize = 50; // Smaller batches for better performance
    
    for (let i = 0; i < robots.length; i += batchSize) {
      const batch = robots.slice(i, i + batchSize);
      
      try {
        const promises = batch.map(robot => this.robotService.create(robot));
        await Promise.all(promises);
        
        if (i % 200 === 0) { // Log every 200 records
          console.log(`  ✅ ${batchName}: Processed ${Math.min(i + batchSize, robots.length)}/${robots.length} robots`);
        }
      } catch (error) {
        console.error(`❌ Error in batch ${batchName} at index ${i}:`, error);
      }
    }
  }
}

// Check command line argument for advanced seeding
const args = process.argv.slice(2);
const useAdvanced = args.includes('--advanced') || args.includes('-a');

async function runSeeder() {
  if (useAdvanced) {
    const seeder = new AdvancedDatabaseSeeder();
    await seeder.seed();
  } else {
    // Use the basic seeder from the previous implementation
    const { DatabaseSeeder } = await import('./seed-database-basic');
    const seeder = new DatabaseSeeder();
    await seeder.seed();
  }
  process.exit(0);
}

runSeeder().catch(error => {
  console.error('Failed to run seeder:', error);
  process.exit(1);
});