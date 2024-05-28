import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from './models/user.model';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
  ) {}

  public async findListOfUsers(email: string): Promise<UserModel[]> {
    return await this.userModel
      .find({ email })
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  public async findUserByEmail(email: string): Promise<UserModel | null> {
    const user = await this.userModel
      .findOne({ email })
      .select('+passwordHash +salt')
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!user) {
      throw new HttpException(`User with this email ${email} not found`, HttpStatus.NOT_FOUND);
    }

    return user;
  }

  public async deleteUserById(id: string): Promise<UserModel | null> {
    const deletedUser = await this.userModel
      .findByIdAndDelete(id)
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!deletedUser) {
      throw new HttpException(`User with this id ${id} not found`, HttpStatus.NOT_FOUND);
    }

    return deletedUser;
  }

  public async updateUserById(id: string, attrs: Partial<UserModel>): Promise<UserModel | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, attrs, { new: true })
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!updatedUser) {
      throw new HttpException(`User with this id ${id} not found`, HttpStatus.NOT_FOUND);
    }

    return updatedUser;
  }
}
