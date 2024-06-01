import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubCategoryDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;
}

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsArray()
  @ValidateNested()
  @Type(() => SubCategoryDto)
  readonly subcategories: SubCategoryDto[];
}
