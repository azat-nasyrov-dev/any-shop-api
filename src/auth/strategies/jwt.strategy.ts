import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadInterface } from '../types/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  public async validate(payload: JwtPayloadInterface): Promise<JwtPayloadInterface> {
    return {
      id: payload.id,
      email: payload.email,
    };
  }
}
