import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from '../users/models/user.model';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { promisify } from 'util';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { TokenModel } from './models/token.model';
import { JwtService } from '@nestjs/jwt';
import * as uuid from 'uuid';
import { TokensInterface } from './types/tokens.interface';

const randomBytesPromise = promisify(crypto.randomBytes);
const pbkdf2Promise = promisify(crypto.pbkdf2);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
    @InjectModel(TokenModel.name)
    private readonly tokenModel: Model<TokenModel>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(registerDto: RegisterDto): Promise<UserModel> {
    const users = await this.usersService.findListOfUsers(registerDto.email);

    if (users.length) {
      throw new HttpException('This user has already been registered', HttpStatus.BAD_REQUEST);
    }

    const salt = await this.generateSalt();
    const passwordHash = await this.generatePassword(registerDto.password, salt);

    const newUser = new this.userModel({
      email: registerDto.email,
      displayName: registerDto.displayName,
      passwordHash,
      salt,
    });

    return await newUser.save().catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  public async login(email: string, password: string): Promise<TokensInterface> {
    const user = await this.validateUser(email, password);
    const tokens = await this.issueToken(user);

    return { accessToken: tokens[0], refreshToken: tokens[1] };
  }

  public async validateUser(email: string, password: string): Promise<UserModel> {
    const user = await this.usersService.findUserByEmail(email);
    const isValidPassword = await this.checkPassword(password, user.salt, user.passwordHash);

    if (!isValidPassword) {
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  public async issueToken(user: UserModel): Promise<string[]> {
    const payload = { id: user.id, email: user.email };
    const accessToken = 'Bearer ' + (await this.jwtService.signAsync(payload));
    const refreshToken = uuid.v4();

    await this.tokenModel.create({ accessToken, refreshToken, sub: user.id }).catch((err) => {
      this.logger.error(err);
      return null;
    });

    return [accessToken, refreshToken];
  }

  public async refreshToken(accessToken: string, refreshToken: string): Promise<TokensInterface> {
    const token = await this.tokenModel
      .findOneAndDelete({ accessToken, refreshToken })
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!token) {
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userModel
      .findById(token.sub)
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const [newAccessToken, newRefreshToken] = await this.issueToken(user);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  public async validateOAuthUser(user: any): Promise<UserModel> {
    const existingUser = await this.userModel
      .findOne({ 'oauth.id': user.oauth[0].id, 'oauth.provider': 'github' })
      .exec();

    if (existingUser) {
      return existingUser;
    }

    const newUser = new this.userModel(user);
    return await newUser.save().catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  private async generateSalt(): Promise<string> {
    const buffer = await randomBytesPromise(
      Number(this.configService.get<number>('CRYPTO_ITERATIONS')),
    );

    return buffer.toString('hex');
  }

  private async generatePassword(password: string, salt: string): Promise<string> {
    const derivedKey = await pbkdf2Promise(
      password,
      salt,
      Number(this.configService.get<number>('CRYPTO_ITERATIONS')),
      Number(this.configService.get<number>('CRYPTO_HASH_LENGTH')),
      this.configService.get<string>('CRYPTO_HASH_ALGORITHM'),
    );

    return derivedKey.toString('hex');
  }

  private async checkPassword(
    password: string,
    salt: string,
    passwordHash: string,
  ): Promise<boolean> {
    const hash = await this.generatePassword(password, salt);
    return hash === passwordHash;
  }
}
