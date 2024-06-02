import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryModel } from './models/category.model';
import { CategoriesResponseInterface } from './types/categories-response.interface';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    createCategory: jest.fn(),
    findListOfCategories: jest.fn(),
    deleteCategoryById: jest.fn(),
    updateCategoryById: jest.fn(),
    buildCategoriesResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        title: 'New Category',
        subcategories: [{ title: 'Subcategory' }],
      };
      const result = { id: '1', ...createCategoryDto };
      mockCategoriesService.createCategory.mockResolvedValue(result);

      expect(await controller.createCategory(createCategoryDto)).toEqual(result);
      expect(mockCategoriesService.createCategory).toHaveBeenCalledWith(createCategoryDto);
    });
  });

  describe('findListOfCategories', () => {
    it('should return an array of categories', async () => {
      const categories = [
        { id: '1', title: 'Category', subcategories: [{ title: 'Subcategory' }] },
      ] as unknown as CategoryModel[];
      const response: CategoriesResponseInterface = { categories };
      mockCategoriesService.findListOfCategories.mockResolvedValue(categories);
      mockCategoriesService.buildCategoriesResponse.mockReturnValue(response);

      expect(await controller.findListOfCategories()).toEqual(response);
      expect(mockCategoriesService.findListOfCategories).toHaveBeenCalled();
      expect(mockCategoriesService.buildCategoriesResponse).toHaveBeenCalledWith(categories);
    });
  });

  describe('deleteCategoryById', () => {
    it('should delete a category by id', async () => {
      const result = { id: '1', title: 'Category', subcategories: [{ title: 'Subcategory' }] };
      mockCategoriesService.deleteCategoryById.mockResolvedValue(result);

      expect(await controller.deleteCategoryById('1')).toEqual(result);
      expect(mockCategoriesService.deleteCategoryById).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException if category not found', async () => {
      mockCategoriesService.deleteCategoryById.mockImplementation(() => {
        throw new HttpException('No category with 1 id', HttpStatus.NOT_FOUND);
      });

      await expect(controller.deleteCategoryById('1')).rejects.toThrow(HttpException);
      await expect(controller.deleteCategoryById('1')).rejects.toThrow(
        new HttpException('No category with 1 id', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateCategoryById', () => {
    it('should update a category by id', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        title: 'Updated Category',
        subcategories: [{ title: 'Updated Subcategory' }],
      };
      const result = { id: '1', ...updateCategoryDto };
      mockCategoriesService.updateCategoryById.mockResolvedValue(result);

      expect(await controller.updateCategoryById('1', updateCategoryDto)).toEqual(result);
      expect(mockCategoriesService.updateCategoryById).toHaveBeenCalledWith('1', updateCategoryDto);
    });

    it('should throw HttpException if category not found', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        title: 'Updated Category',
        subcategories: [{ title: 'Updated Subcategory' }],
      };
      mockCategoriesService.updateCategoryById.mockImplementation(() => {
        throw new HttpException('No category with 1 id', HttpStatus.NOT_FOUND);
      });

      await expect(controller.updateCategoryById('1', updateCategoryDto)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.updateCategoryById('1', updateCategoryDto)).rejects.toThrow(
        new HttpException('No category with 1 id', HttpStatus.NOT_FOUND),
      );
    });
  });
});
