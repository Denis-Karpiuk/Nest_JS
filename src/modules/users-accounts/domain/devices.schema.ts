import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class Device {
  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Number, required: true })
  iat: number;

  @Prop({ type: Number, required: true })
  exp: number;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceType = {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;
  userId: string;
  iat: number;
  exp: number;
};
