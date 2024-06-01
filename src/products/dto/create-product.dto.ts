import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  readonly category: string;

  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  readonly subcategory: string;

  @IsArray()
  @IsString({ each: true })
  readonly images: string[];
}
