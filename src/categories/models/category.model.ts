import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class SubCategoryModel extends Document {
  @Prop({ required: true })
  title: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategoryModel);

@Schema()
export class CategoryModel extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [SubCategorySchema] })
  subcategories: Types.Array<SubCategoryModel>;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryModel);
