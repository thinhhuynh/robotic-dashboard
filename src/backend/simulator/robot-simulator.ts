import { io, Socket } from 'socket.io-client';

interface RobotData {
  status: 'online' | 'offline' | 'maintenance';
  battery: number;
  wifiStrength: number;
  charging: boolean;
  temperature: number;
  memory: number;
  location?: {
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

class RobotSimulator {
  private socket: Socket;
  private robotId: string;
  private intervalId: NodeJS.Timeout;

  constructor(robotId: string, serverUrl = 'http://localhost:8080') {
    this.robotId = robotId;
    this.socket = io(`${serverUrl}/robots`, {
      query: { robotId }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.socket.on('connect', () => {
      console.log(`Robot ${this.robotId} connected to server`);
      this.startSendingData();
    });

    this.socket.on('disconnect', () => {
      console.log(`Robot ${this.robotId} disconnected from server`);
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    });

    this.socket.on('error', (error) => {
      console.error(`Robot ${this.robotId} error:`, error);
    });
  }

  private generateRobotData(): RobotData {
    const statuses: Array<'online' | 'offline' | 'maintenance'> = ['online', 'offline', 'maintenance'];
    
    return {
      status: statuses[Math.floor(Math.random() * statuses.length)],
      battery: Math.floor(Math.random() * 101),
      wifiStrength: Math.floor(Math.random() * 101) - 100,
      charging: Math.random() > 0.5,
      temperature: Math.floor(Math.random() * 200) - 50,
      memory: Math.floor(Math.random() * 101),
      location: {
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 10,
      },
    };
  }

  private startSendingData(): void {
    this.intervalId = setInterval(() => {
      const data = this.generateRobotData();
      this.socket.emit('robotData', data);
      console.log(`Robot ${this.robotId} sent data:`, data);
    }, 5000); // Send data every 5 seconds
  }

  public disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.socket.disconnect();
  }
}

// Create multiple robot simulators
const robots: RobotSimulator[] = [];
const robotCount = parseInt(process.env.ROBOT_COUNT || '3');

for (let i = 1; i <= robotCount; i++) {
  const robot = new RobotSimulator(`robot-${i.toString().padStart(3, '0')}`);
  robots.push(robot);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down robot simulators...');
  robots.forEach(robot => robot.disconnect());
  process.exit(0);
});

console.log(`Started ${robotCount} robot simulators`);