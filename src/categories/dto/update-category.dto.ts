import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubCategoryDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => SubCategoryDto)
  readonly subcategories?: SubCategoryDto[];
}
