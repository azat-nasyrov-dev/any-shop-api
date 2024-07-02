import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserModel } from './models/user.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { Types } from 'mongoose';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findListOfUsers: jest.fn(),
    findUserByEmail: jest.fn(),
    deleteUserById: jest.fn(),
    updateUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findListOfUsers', () => {
    it('should return a list of users', async () => {
      const users = [{ email: 'test@example.com' }] as UserModel[];
      jest.spyOn(service, 'findListOfUsers').mockResolvedValueOnce(users);

      const result = await controller.findListOfUsers('test@example.com');
      expect(result).toEqual(users);
      expect(service.findListOfUsers).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'findListOfUsers').mockRejectedValueOnce(new Error('Error'));

      await expect(controller.findListOfUsers('test@example.com')).rejects.toThrow(Error);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = { email: 'test@example.com' } as UserModel;
      jest.spyOn(service, 'findUserByEmail').mockResolvedValueOnce(user);

      const result = await controller.findUserByEmail('test@example.com');
      expect(result).toEqual(user);
      expect(service.findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'findUserByEmail').mockRejectedValueOnce(new Error('Error'));

      await expect(controller.findUserByEmail('test@example.com')).rejects.toThrow(Error);
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user by id', async () => {
      const user = { id: new Types.ObjectId() } as UserModel;
      jest.spyOn(service, 'deleteUserById').mockResolvedValueOnce(user);

      const result = await controller.deleteUserById(user.id.toHexString());
      expect(result).toEqual(user);
      expect(service.deleteUserById).toHaveBeenCalledWith(user.id.toHexString());
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'deleteUserById').mockRejectedValueOnce(new Error('Error'));

      await expect(controller.deleteUserById(new Types.ObjectId().toHexString())).rejects.toThrow(
        Error,
      );
    });
  });

  describe('updateUserById', () => {
    it('should update a user by id', async () => {
      const user = { id: new Types.ObjectId() } as UserModel;
      const updateUserDto: UpdateUserDto = { email: 'updated@example.com' };
      jest.spyOn(service, 'updateUserById').mockResolvedValueOnce(user);

      const result = await controller.updateUserById(user.id.toHexString(), updateUserDto);
      expect(result).toEqual(user);
      expect(service.updateUserById).toHaveBeenCalledWith(user.id.toHexString(), updateUserDto);
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'updateUserById').mockRejectedValueOnce(new Error('Error'));

      await expect(
        controller.updateUserById(new Types.ObjectId().toHexString(), {
          email: 'updated@example.com',
        }),
      ).rejects.toThrow(Error);
    });
  });
});
