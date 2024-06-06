import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UserModel } from '../users/models/user.model';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { JwtPayloadInterface } from './types/jwt-payload.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokensInterface } from './types/tokens.interface';
import { GitHubAuthGuard } from './guards/github-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public mustBeAuthenticated(@Req() req: Request): JwtPayloadInterface {
    return req.user as JwtPayloadInterface;
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async register(@Body() registerDto: RegisterDto): Promise<UserModel> {
    return await this.authService.register(registerDto);
  }

  @Get('confirm/:token')
  public async confirmEmail(@Param('token') token: string): Promise<string> {
    return await this.authService.confirmEmail(token);
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokens = await this.authService.login(loginDto.email, loginDto.password);
    res.setHeader('Authorization', tokens.accessToken);
    res.json(tokens);
  }

  @Post('refresh')
  public async refreshToken(
    @Body() body: { accessToken: string; refreshToken: string },
  ): Promise<TokensInterface> {
    return await this.authService.refreshToken(body.accessToken, body.refreshToken);
  }

  @Get('/oauth/:provider')
  @UseGuards(GitHubAuthGuard)
  public async gitHubAuth(): Promise<void> {}

  @Get('/oauth/:provider/callback')
  @UseGuards(GitHubAuthGuard)
  public async gitHubAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const user = req.user as UserModel;
    const tokens = await this.authService.issueToken(user);

    res.setHeader('Authorization', tokens[0]);
    res.json({
      id: user.id,
      login: user.email,
      name: user.displayName,
      oauth: [
        {
          id: user.oauth[0].id,
          provider: user.oauth[0].provider,
          accessToken: tokens[0],
        },
      ],
    });
  }
}
