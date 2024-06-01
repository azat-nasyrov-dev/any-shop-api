import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema, ProductsModel } from './models/products.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: ProductsModel.name, schema: ProductSchema }])],
})
export class ProductsModule {}
