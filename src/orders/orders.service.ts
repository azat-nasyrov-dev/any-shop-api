import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderModel } from './models/order.model';
import { Model } from 'mongoose';
import { ProductModel } from '../products/models/product.model';
import { MailService } from '../auth/mail.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserModel } from '../users/models/user.model';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(OrderModel.name)
    private readonly orderModel: Model<OrderModel>,
    @InjectModel(ProductModel.name)
    private readonly productModel: Model<ProductModel>,
    private readonly mailService: MailService,
  ) {}

  public async createOrder(createOrderDto: CreateOrderDto, user: UserModel): Promise<OrderModel> {
    const order = new this.orderModel({
      user: user.id,
      product: createOrderDto.product,
      phone: createOrderDto.phone,
      address: createOrderDto.address,
    });

    await order.save().catch((err) => {
      this.logger.error(err);
      return null;
    });

    const product = await this.productModel
      .findById(order.product)
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    await this.mailService.sendMail({
      template: 'order-confirmation',
      locals: { order, product },
      to: user.email,
      subject: 'Order creation confirmation',
    });

    return order;
  }

  public async getOrders(user: UserModel): Promise<OrderModel[]> {
    return await this.orderModel
      .find({ user: user.id })
      .populate('product')
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }
}
