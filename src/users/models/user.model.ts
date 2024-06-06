import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class OAuth {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  provider: string;

  @Prop()
  accessToken: string;

  @Prop()
  refreshToken: string;
}

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

  @Prop({ type: [OAuth], _id: false })
  oauth: OAuth[];

  @Prop({ index: true })
  verificationToken: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.passwordHash;
    delete ret.salt;

    return ret;
  },
});
