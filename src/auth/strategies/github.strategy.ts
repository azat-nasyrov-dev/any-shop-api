import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  public async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    try {
      const { id, username, displayName, emails } = profile;
      const email = emails && emails.length ? emails[0].value : null;

      const user = {
        id: id,
        login: username,
        displayName: displayName || username,
        email,
        oauth: [
          {
            id,
            provider: 'github',
            accessToken,
            refreshToken,
          },
        ],
      };
      const validatedUser = await this.authService.validateOAuthUser(user);
      done(null, validatedUser);
    } catch (err) {
      done(err, false);
    }
  }
}
