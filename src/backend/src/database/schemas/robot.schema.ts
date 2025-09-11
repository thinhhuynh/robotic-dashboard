import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RobotDocument = Robot & Document;

@Schema({ 
  timestamps: true, 
  collection: 'robot_telemetry' 
})
export class Robot {
  @Prop({ required: true, index: true })
  robotId: string;

  @Prop({ 
    required: true, 
    enum: ['online', 'offline', 'maintenance'],
    index: true 
  })
  status: string;

  @Prop({ 
    required: true, 
    min: 0, 
    max: 100,
    index: true 
  })
  battery: number;

  @Prop({ 
    required: true, 
    min: -100, 
    max: 0 
  })
  wifiStrength: number;

  @Prop({ 
    required: true,
    index: true 
  })
  charging: boolean;

  @Prop({ 
    required: true, 
    min: -50, 
    max: 150 
  })
  temperature: number;

  @Prop({ 
    required: true, 
    min: 0, 
    max: 100 
  })
  memory: number;

  @Prop({ 
    default: Date.now,
    index: true 
  })
  timestamp: Date;

  @Prop({
    type: {
      x: Number,
      y: Number,
      z: Number
    }
  })
  location: {
    x: number;
    y: number;
    z: number;
  };

  @Prop({
    type: {
      code: String,
      message: String,
      timestamp: Date
    }
  })
  lastError: {
    code: string;
    message: string;
    timestamp: Date;
  };
}

export const RobotSchema = SchemaFactory.createForClass(Robot);

// Compound indexes for efficient queries
RobotSchema.index({ robotId: 1, timestamp: -1 });
RobotSchema.index({ battery: 1, charging: 1 }); // For alert queries
RobotSchema.index({ timestamp: -1 }); // For time-based queries

// TTL index to automatically remove old data (optional - keeps 30 days)
RobotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static method to get latest status for all robots
RobotSchema.statics.getLatestStatuses = async function() {
  return this.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: '$robotId',
        latestData: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: '$latestData' } }
  ]);
};

// Static method to get historical data for a robot
RobotSchema.statics.getHistory = async function(robotId: string, hours = 6) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    robotId: robotId,
    timestamp: { $gte: since }
  }).sort({ timestamp: 1 }).lean();
};

// Instance method to check if battery is critical
RobotSchema.methods.isBatteryCritical = function() {
  return this.battery < 20 && !this.charging;
};