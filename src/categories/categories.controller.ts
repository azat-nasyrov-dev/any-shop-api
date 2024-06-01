import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryModel } from './models/category.model';
import { CategoriesResponseInterface } from './types/categories-response.interface';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryModel> {
    return await this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  public async findListOfCategories(): Promise<CategoriesResponseInterface> {
    const categories = await this.categoriesService.findListOfCategories();
    return this.categoriesService.buildCategoriesResponse(categories);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  public async deleteCategoryById(@Param('id') id: string): Promise<CategoryModel | null> {
    return await this.categoriesService.deleteCategoryById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async updateCategoryById(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryModel | null> {
    return await this.categoriesService.updateCategoryById(id, updateCategoryDto);
  }
}
