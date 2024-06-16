import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserModel } from '../users/models/user.model';
import { OrderModel } from './models/order.model';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async checkout(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<{ order: string }> {
    const user = req.user as UserModel;
    const order = await this.ordersService.createOrder(createOrderDto, user);

    return { order: order.id };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getOrderList(@Req() req: Request): Promise<{ orders: OrderModel[] }> {
    const user = req.user as UserModel;
    const orders = await this.ordersService.getOrders(user);

    return { orders };
  }
}
