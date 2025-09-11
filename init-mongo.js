// MongoDB initialization script for robotic dashboard
print('🚀 Initializing MongoDB for Robotic Dashboard...');

// Switch to the robotic_dashboard database
db = db.getSiblingDB('robotic_dashboard');

// Create collections
db.createCollection('robots');
db.createCollection('robot_history');

// Create indexes for better performance
db.robots.createIndex({ "robotId": 1 }, { unique: true });
db.robots.createIndex({ "status": 1 });
db.robots.createIndex({ "createdAt": 1 });

db.robot_history.createIndex({ "robotId": 1 });
db.robot_history.createIndex({ "timestamp": 1 });
db.robot_history.createIndex({ "robotId": 1, "timestamp": -1 });

// Insert sample robot data
print('📊 Inserting sample robot data...');

const sampleRobots = [
  {
    robotId: 'robot-001',
    name: 'Explorer Alpha',
    type: 'exploration',
    status: 'online',
    battery: 85,
    temperature: 23,
    memory: 67,
    wifiStrength: -45,
    charging: false,
    location: { x: 10.5, y: 25.3, z: 0.0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    robotId: 'robot-002',
    name: 'Guardian Beta',
    type: 'security',
    status: 'offline',
    battery: 45,
    temperature: 28,
    memory: 23,
    wifiStrength: -60,
    charging: true,
    location: { x: 5.2, y: 12.7, z: 0.0 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    robotId: 'robot-003',
    name: 'Cleaner Gamma',
    type: 'maintenance',
    status: 'maintenance',
    battery: 92,
    temperature: 21,
    memory: 45,
    wifiStrength: -35,
    charging: false,
    location: { x: 15.8, y: 8.9, z: 0.0 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Insert sample robots
db.robots.insertMany(sampleRobots);

// Insert sample history data
print('📈 Inserting sample history data...');

const generateHistoryData = (robotId, days = 7) => {
  const history = [];
  const now = new Date();
  
  for (let i = 0; i < days * 24; i++) { // One record per hour
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
    const statuses = ['online', 'offline', 'maintenance'];
    
    history.push({
      robotId: robotId,
      timestamp: timestamp,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      battery: Math.floor(Math.random() * 100),
      temperature: Math.floor(Math.random() * 30) + 15,
      memory: Math.floor(Math.random() * 100),
      location: {
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 10
      },
      event: i % 10 === 0 ? 'status_change' : null,
      message: i % 15 === 0 ? 'Routine maintenance check completed' : null
    });
  }
  
  return history;
};

// Generate history for each robot
sampleRobots.forEach(robot => {
  const history = generateHistoryData(robot.robotId, 7);
  db.robot_history.insertMany(history);
  print(`📊 Inserted ${history.length} history records for ${robot.robotId}`);
});

// Create user for the application (optional)
db.createUser({
  user: 'roboticapp',
  pwd: 'roboticpass123',
  roles: [
    {
      role: 'readWrite',
      db: 'robotic_dashboard'
    }
  ]
});

print('✅ MongoDB initialization completed successfully!');
print('📊 Collections created: robots, robot_history');
print('🔍 Indexes created for performance optimization');
print('🤖 Sample robots inserted: robot-001, robot-002, robot-003');
print('📈 Sample history data inserted for 7 days');
print('👤 Application user created: roboticapp');
print('🚀 Database ready for Robotic Dashboard!');