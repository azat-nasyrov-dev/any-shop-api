import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserModel>;

  const mockUserModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(UserModel.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserModel>>(getModelToken(UserModel.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findListOfUsers', () => {
    it('should return a list of users', async () => {
      const users = [{ email: 'test@example.com' }] as UserModel[];
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(users),
      });

      const result = await service.findListOfUsers('test@example.com');
      expect(result).toEqual(users);
      expect(mockUserModel.find).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should handle errors', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(new Error('Error')),
      });

      const result = await service.findListOfUsers('test@example.com');
      expect(result).toBeNull();
      expect(mockUserModel.find).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = { email: 'test@example.com' } as UserModel;
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(user),
      });

      const result = await service.findUserByEmail('test@example.com');
      expect(result).toEqual(user);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should throw an error if user is not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.findUserByEmail('test@example.com')).rejects.toThrow(
        new HttpException('User with this email test@example.com not found', HttpStatus.NOT_FOUND),
      );
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should handle errors', async () => {
      mockUserModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(new Error('Error')),
      });

      await expect(service.findUserByEmail('test@example.com')).rejects.toThrow(
        new HttpException('User with this email test@example.com not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user by id', async () => {
      const id = new Types.ObjectId().toHexString();
      const user = { id } as UserModel;
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(user),
      });

      const result = await service.deleteUserById(id);
      expect(result).toEqual(user);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('should throw an error if user is not found', async () => {
      const id = new Types.ObjectId().toHexString();
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.deleteUserById(id)).rejects.toThrow(
        new HttpException(`User with this id ${id} not found`, HttpStatus.NOT_FOUND),
      );
    });

    it('should handle errors', async () => {
      const id = new Types.ObjectId().toHexString();
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(new Error('Error')),
      });

      const result = await service.deleteUserById(id);
      expect(result).toBeNull();
    });
  });

  describe('updateUserById', () => {
    it('should update a user by id', async () => {
      const id = new Types.ObjectId().toHexString();
      const user = { id } as UserModel;
      const updateUserDto: Partial<UserModel> = { email: 'updated@example.com' };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(user),
      });

      const result = await service.updateUserById(id, updateUserDto);
      expect(result).toEqual(user);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateUserDto, {
        new: true,
      });
    });

    it('should throw an error if user is not found', async () => {
      const id = new Types.ObjectId().toHexString();
      const updateUserDto: Partial<UserModel> = { email: 'updated@example.com' };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.updateUserById(id, updateUserDto)).rejects.toThrow(
        new HttpException(`User with this id ${id} not found`, HttpStatus.NOT_FOUND),
      );
    });

    it('should handle errors', async () => {
      const id = new Types.ObjectId().toHexString();
      const updateUserDto: Partial<UserModel> = { email: 'updated@example.com' };
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(new Error('Error')),
      });

      const result = await service.updateUserById(id, updateUserDto);
      expect(result).toBeNull();
    });
  });
});
