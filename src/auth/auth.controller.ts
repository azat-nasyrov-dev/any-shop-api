import {
  Body,
  Controller,
  Get,
  HttpCode,
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

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
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
}
