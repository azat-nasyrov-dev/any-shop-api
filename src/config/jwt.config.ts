import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Algorithm } from 'jsonwebtoken';

export const getJwtConfig = (): JwtModuleAsyncOptions => ({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      algorithm: configService.get<Algorithm>('JWT_ALGORITHM'),
      expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    },
  }),
  inject: [ConfigService],
});
