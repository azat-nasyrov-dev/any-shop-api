import { IsArray, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  readonly price?: number;

  @IsOptional()
  @IsString()
  @IsMongoId()
  readonly category?: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  readonly subcategory?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly images?: string[];
}
