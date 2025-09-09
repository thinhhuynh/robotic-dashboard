import mongoose from 'mongoose';

const robotSchema = new mongoose.Schema({
  robotId: {
    type: mongoose.Schema.Types.UUID,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    required: true,
    index: true
  },
  battery: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
    index: true
  },
  wifiStrength: {
    type: Number,
    min: -100,
    max: 0,
    required: true
  },
  charging: {
    type: Boolean,
    required: true,
    index: true
  },
  temperature: {
    type: Number,
    min: -50,
    max: 150,
    required: true
  },
  memory: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  location: {
    x: Number,
    y: Number,
    z: Number
  },
  lastError: {
    code: String,
    message: String,
    timestamp: Date
  }
}, {
  timestamps: true,
  collection: 'robot_telemetry'
});

// Compound indexes for efficient queries
robotSchema.index({ robotId: 1, timestamp: -1 });
robotSchema.index({ battery: 1, charging: 1 }); // For alert queries
robotSchema.index({ timestamp: -1 }); // For time-based queries

// TTL index to automatically remove old data (optional - keeps 30 days)
robotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });


// Static method to get latest status for all robots
robotSchema.statics.getLatestStatuses = async function () {
  return this.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: '$robotId',
        latestData: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$latestData' } },
  ]);
};

// Static method to get historical data for a robot
robotSchema.statics.getHistory = async function (robotId, hours = 6) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    robotId: robotId,
    timestamp: { $gte: since },
  })
    .sort({ timestamp: 1 })
    .lean();
};

// Instance method to check if battery is critical
robotSchema.methods.isBatteryCritical = function () {
  return this.battery < 20 && !this.charging;
};

const Robot = mongoose.models.Robot || mongoose.model('Robot', robotSchema);
export default Robot;