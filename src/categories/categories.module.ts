import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModel, CategorySchema } from './models/category.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: CategoryModel.name, schema: CategorySchema }])],
})
export class CategoriesModule {}
