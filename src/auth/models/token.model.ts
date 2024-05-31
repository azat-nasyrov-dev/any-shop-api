import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSchema } from 'mongoose';
import { UserModel } from '../../users/models/user.model';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

@Schema()
export class TokenModel extends Document {
  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: UserModel.name, required: true })
  sub: string;

  @Prop({ type: Date, default: new Date() })
  ts: Date;
}

export const TokenSchema = SchemaFactory.createForClass(TokenModel);

TokenSchema.index({ accessToken: 1, refreshToken: 1 });
TokenSchema.index(
  { ts: 1 },
  { expires: configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') },
);
