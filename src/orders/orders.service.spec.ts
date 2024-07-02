import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderModel } from './models/order.model';
import { ProductModel } from '../products/models/product.model';
import { MailService } from '../auth/mail.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserModel } from '../users/models/user.model';

const mockOrderModel = {
  create: jest.fn(),
  find: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockProductModel = {
  findById: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockMailService = {
  sendMail: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: Model<OrderModel>;
  let productModel: Model<ProductModel>;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(OrderModel.name), useValue: mockOrderModel },
        { provide: getModelToken(ProductModel.name), useValue: mockProductModel },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get<Model<OrderModel>>(getModelToken(OrderModel.name));
    productModel = module.get<Model<ProductModel>>(getModelToken(ProductModel.name));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should create and return an order', async () => {
      const createOrderDto: CreateOrderDto = {
        product: 'product-id',
        phone: '+1234567890',
        address: '123 Main St',
      };
      const user: UserModel = {
        id: 'user-id',
        email: 'test@example.com',
      } as UserModel;

      const createdOrder = {
        user: user.id,
        product: createOrderDto.product,
        phone: createOrderDto.phone,
        address: createOrderDto.address,
        save: jest.fn().mockResolvedValue(true),
      } as unknown as OrderModel;

      const product = {
        _id: 'product-id',
      } as ProductModel;

      mockOrderModel.create.mockResolvedValue(createdOrder);
      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });
      mockMailService.sendMail.mockResolvedValue(undefined);

      const result = await service.createOrder(createOrderDto, user);

      expect(result).toEqual(createdOrder);
      expect(orderModel.create).toHaveBeenCalledWith({
        user: user.id,
        product: createOrderDto.product,
        phone: createOrderDto.phone,
        address: createOrderDto.address,
      });
      expect(productModel.findById).toHaveBeenCalledWith(createdOrder.product);
      expect(mailService.sendMail).toHaveBeenCalledWith({
        template: 'order-confirmation',
        locals: { order: createdOrder, product },
        to: user.email,
        subject: 'Order creation confirmation',
      });
    });

    it('should log error if order save fails', async () => {
      const createOrderDto: CreateOrderDto = {
        product: 'product-id',
        phone: '+1234567890',
        address: '123 Main St',
      };
      const user: UserModel = {
        id: 'user-id',
        email: 'test@example.com',
      } as UserModel;

      const error = new Error('Save error');
      mockOrderModel.create.mockRejectedValue(error);

      const loggerSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.createOrder(createOrderDto, user);

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('getOrders', () => {
    it('should return orders for a user', async () => {
      const user: UserModel = {
        id: 'user-id',
      } as UserModel;

      const orders = [
        {
          user: 'user-id',
          product: 'product-id',
          phone: '+1234567890',
          address: '123 Main St',
        },
      ] as unknown as OrderModel[];

      mockOrderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(orders),
      });

      const result = await service.getOrders(user);

      expect(result).toEqual(orders);
      expect(orderModel.find).toHaveBeenCalledWith({ user: user.id });
      expect(orderModel.populate).toHaveBeenCalledWith('product');
    });

    it('should log error if get orders fails', async () => {
      const user: UserModel = {
        id: 'user-id',
      } as UserModel;

      const error = new Error('Find error');
      mockOrderModel.find.mockRejectedValue(error);

      const loggerSpy = jest.spyOn(service['logger'], 'error');

      const result = await service.getOrders(user);

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(error);
    });
  });
});
