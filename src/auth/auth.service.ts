import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from '../users/models/user.model';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { promisify } from 'util';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';

const randomBytesPromise = promisify(crypto.randomBytes);
const pbkdf2Promise = promisify(crypto.pbkdf2);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
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
