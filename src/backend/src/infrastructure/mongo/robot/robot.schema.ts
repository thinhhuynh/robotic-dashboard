import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class RobotTelemetry extends Document {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ type: Object, required: true })
  data: Record<string, any>;
}

export const RobotTelemetrySchema =
  SchemaFactory.createForClass(RobotTelemetry);
