import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class EmailConfirmation {
  @Prop({ type: String, required: true, default: '' })
  confirmationCode: string;

  @Prop({ type: String, required: true, default: new Date().toISOString })
  expirationDate: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: false;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
