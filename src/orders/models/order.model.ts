import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSchema } from 'mongoose';
import { UserModel } from '../../users/models/user.model';
import { ProductModel } from '../../products/models/product.model';

@Schema()
export class OrderModel extends Document {
  @Prop({ type: MSchema.Types.ObjectId, ref: UserModel.name, required: true })
  user: MSchema.Types.ObjectId;

  @Prop({ type: MSchema.Types.ObjectId, ref: ProductModel.name, required: true })
  product: MSchema.Types.ObjectId;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);
