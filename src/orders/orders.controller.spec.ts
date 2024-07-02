import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserModel } from '../users/models/user.model';
import { OrderModel } from './models/order.model';
import { Types } from 'mongoose';
import { Request } from 'express';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn(),
            getOrders: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order', async () => {
    const createOrderDto: CreateOrderDto = {
      product: new Types.ObjectId().toHexString(),
      phone: '+1234567890',
      address: '123 Main St',
    };
    const user: UserModel = {
      id: new Types.ObjectId().toHexString(),
    } as UserModel;
    const expectedOrderId = new Types.ObjectId().toHexString();
    const mockRequest = {
      user,
      body: createOrderDto,
    } as unknown as Request;

    jest
      .spyOn(ordersService, 'createOrder')
      .mockResolvedValueOnce({ id: expectedOrderId } as OrderModel);

    const result = await controller.checkout(createOrderDto, mockRequest);

    expect(result).toEqual({ order: expectedOrderId });
    expect(ordersService.createOrder).toHaveBeenCalledWith(createOrderDto, user);
  });

  it('should return list of orders', async () => {
    const user: UserModel = {
      id: new Types.ObjectId().toHexString(),
    } as UserModel;

    const expectedOrders: OrderModel[] = [
      {
        id: new Types.ObjectId().toHexString(),
        user: user.id,
        product: new Types.ObjectId().toHexString(),
        phone: '+1234567890',
        address: '123 Main St',
      },
    ];

    const mockRequest = {
      user,
    } as unknown as Request;

    jest.spyOn(ordersService, 'getOrders').mockResolvedValueOnce(expectedOrders);

    const result = await controller.getOrderList(mockRequest);

    expect(result).toEqual({ orders: expectedOrders });
    expect(ordersService.getOrders).toHaveBeenCalledWith(user);
  });
});
