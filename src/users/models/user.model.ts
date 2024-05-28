import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserModel extends Document {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ unique: true, required: true })
  displayName: string;

  @Prop({ select: false })
  passwordHash: string;

  @Prop({ select: false })
  salt: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.passwordHash;
    delete ret.salt;

    return ret;
  },
});
