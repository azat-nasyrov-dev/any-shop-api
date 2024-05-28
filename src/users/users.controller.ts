import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  public async findListOfUsers(@Query('email') email: string): Promise<UserModel[]> {
    return await this.usersService.findListOfUsers(email);
  }

  @Get(':email')
  public async findUserByEmail(@Param('email') email: string): Promise<UserModel | null> {
    return await this.usersService.findUserByEmail(email);
  }

  @Delete(':id')
  public async deleteUserById(@Param('id') id: string): Promise<UserModel | null> {
    return await this.usersService.deleteUserById(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async updateUserById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserModel | null> {
    return await this.usersService.updateUserById(id, updateUserDto);
  }
}
