import { IsMongoId, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly product: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/\+?\d{6,14}/, {
    message: 'Invalid phone number format',
  })
  readonly phone: string;

  @IsNotEmpty()
  @IsString()
  readonly address: string;
}
