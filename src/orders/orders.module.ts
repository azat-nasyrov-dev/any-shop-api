import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModel, OrderSchema } from './models/order.model';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AuthModule } from '../auth/auth.module';
import { ProductModel, ProductSchema } from '../products/models/product.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: OrderModel.name, schema: OrderSchema }, { name: ProductModel.name, schema: ProductSchema }]), AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
