import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSchema } from 'mongoose';
import { CategoryModel, SubCategoryModel } from '../../categories/models/category.model';

@Schema()
export class ProductModel extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: MSchema.Types.ObjectId, ref: CategoryModel.name, required: true })
  category: MSchema.Types.ObjectId;

  @Prop({ type: MSchema.Types.ObjectId, ref: SubCategoryModel.name, required: true })
  subcategory: MSchema.Types.ObjectId;

  @Prop({ type: () => [String] })
  images: string[];
}

export const ProductSchema = SchemaFactory.createForClass(ProductModel);
