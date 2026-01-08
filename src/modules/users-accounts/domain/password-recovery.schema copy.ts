import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class PasswordRecoveryInformation {
  @Prop({ type: String, required: true, default: '' })
  recoveryCode: string | null;

  @Prop({ type: String, required: true, default: null })
  expirationDate: Date | null;
}

export const PasswordRecoveryInformationSchema = SchemaFactory.createForClass(
  PasswordRecoveryInformation,
);
