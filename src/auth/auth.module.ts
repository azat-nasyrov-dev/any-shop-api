import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../users/models/user.model';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
