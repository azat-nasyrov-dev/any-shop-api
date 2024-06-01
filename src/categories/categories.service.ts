import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryModel } from './models/category.model';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesResponseInterface } from './types/categories-response.interface';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(CategoryModel.name)
    private readonly categoryModel: Model<CategoryModel>,
  ) {}

  public async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryModel> {
    const newCategory = await this.categoryModel.create(createCategoryDto);
    return await newCategory.save().catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  public async findListOfCategories(): Promise<CategoryModel[]> {
    return await this.categoryModel
      .find()
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  public async deleteCategoryById(id: string): Promise<CategoryModel | null> {
    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!deletedCategory) {
      throw new HttpException(`No category with ${id} id`, HttpStatus.NOT_FOUND);
    }

    return deletedCategory;
  }

  public async updateCategoryById(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryModel | null> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!updatedCategory) {
      throw new HttpException(`No category with ${id} id`, HttpStatus.NOT_FOUND);
    }

    return updatedCategory;
  }

  public buildCategoriesResponse(categories: CategoryModel[]): CategoriesResponseInterface {
    return { categories };
  }
}
