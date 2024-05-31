import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '../users/models/user.model';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModel, TokenSchema } from './models/token.model';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getJwtConfig } from '../config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GitHubStrategy } from './strategies/github.strategy';
import { GitHubAuthGuard } from './guards/github-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: TokenModel.name, schema: TokenSchema },
    ]),
    JwtModule.registerAsync(getJwtConfig()),
    PassportModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, GitHubStrategy, GitHubAuthGuard],
})
export class AuthModule {}
