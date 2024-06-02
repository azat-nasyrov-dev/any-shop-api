import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Model } from 'mongoose';
import { CategoryModel } from './models/category.model';
import { getModelToken } from '@nestjs/mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { HttpException } from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';

const mockCategoryModel = {
  create: jest.fn(),
  find: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let model: Model<CategoryModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(CategoryModel.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    model = module.get<Model<CategoryModel>>(getModelToken(CategoryModel.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create and save a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        title: 'Test Category',
        subcategories: [{ title: 'Test Subcategory' }],
      };
      const saveSpy = jest.fn().mockResolvedValue({ ...createCategoryDto, id: '1' });
      mockCategoryModel.create.mockResolvedValue({ save: saveSpy });

      const result = await service.createCategory(createCategoryDto);

      expect(mockCategoryModel.create).toHaveBeenCalledWith(createCategoryDto);
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual({ ...createCategoryDto, id: '1' });
    });

    it('should return null if save fails', async () => {
      const createCategoryDto: CreateCategoryDto = {
        title: 'Test Category',
        subcategories: [{ title: 'Test Subcategory' }],
      };
      mockCategoryModel.create.mockResolvedValue({
        save: jest.fn().mockRejectedValue(new Error('Save Error')),
      });

      const result = await service.createCategory(createCategoryDto);
      expect(result).toBeNull();
    });
  });

  describe('findListOfCategories', () => {
    it('should return an array of categories', async () => {
      const categories = [{ title: 'Category 1', subcategories: [{ title: 'Subcategory 1' }] }];
      mockCategoryModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(categories) });

      const result = await service.findListOfCategories();

      expect(mockCategoryModel.find).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });

    it('should return null if find fails', async () => {
      mockCategoryModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Find Error')),
      });
      const result = await service.findListOfCategories();

      expect(result).toBeNull();
    });
  });

  describe('deleteCategoryById', () => {
    it('should delete and return the category', async () => {
      const category = {
        id: '1',
        title: 'Category 1',
        subcategories: [{ title: 'Subcategory 1' }],
      };
      mockCategoryModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(category),
      });

      const result = await service.deleteCategoryById('1');

      expect(mockCategoryModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual(category);
    });

    it('should throw HttpException if category not found', async () => {
      mockCategoryModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.deleteCategoryById('1')).rejects.toThrow(HttpException);
    });
  });

  describe('updateCategoryById', () => {
    it('should update and return the category', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        title: 'Updated Category',
        subcategories: [{ title: 'Updated Subcategory' }],
      };
      const updatedCategoryDto = { id: '1', ...updateCategoryDto };
      mockCategoryModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCategoryDto),
      });

      const result = await service.updateCategoryById('1', updateCategoryDto);

      expect(mockCategoryModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updateCategoryDto, {
        new: true,
      });
      expect(result).toEqual(updatedCategoryDto);
    });

    it('should throw HttpException if category not found', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        title: 'Updated Category',
        subcategories: [{ title: 'Updated Subcategory' }],
      };
      mockCategoryModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.updateCategoryById('1', updateCategoryDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('buildCategoriesResponse', () => {
    it('should return categories response', () => {
      const categories = [
        { id: '1', title: 'Category 1', subcategories: [{ title: 'Subcategory 1' }] },
      ] as unknown as CategoryModel[];
      const result = service.buildCategoriesResponse(categories);

      expect(result).toEqual({ categories });
    });
  });
});
