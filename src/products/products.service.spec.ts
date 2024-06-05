import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Model, Types } from 'mongoose';
import { ProductModel } from './models/product.model';
import { getModelToken } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let model: Model<ProductModel>;

  const mockProductModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(ProductModel.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get<Model<ProductModel>>(getModelToken(ProductModel.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create and save a new product', async () => {
      const createProductDto: CreateProductDto = {
        title: 'New Product',
        description: 'Product description',
        price: 50,
        category: 'category 1',
        subcategory: 'subcategory 1',
        images: ['image1', 'image2'],
      };
      const saveSpy = jest.fn().mockResolvedValue({ ...createProductDto, id: '1' });
      mockProductModel.create.mockResolvedValue({ save: saveSpy });

      const result = await service.createProduct(createProductDto);

      expect(mockProductModel.create).toHaveBeenCalledWith(createProductDto);
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual({ ...createProductDto, id: '1' });
    });

    it('should return null if save fails', async () => {
      const createProductDto: CreateProductDto = {
        title: 'New Product',
        description: 'Product description',
        price: 50,
        category: 'category 1',
        subcategory: 'subcategory 1',
        images: ['image1', 'image2'],
      };
      mockProductModel.create.mockResolvedValue({
        save: jest.fn().mockRejectedValue(new Error('Save Error')),
      });

      const result = await service.createProduct(createProductDto);
      expect(result).toBeNull();
    });
  });

  describe('findListOfProducts', () => {
    it('should return an array of products', async () => {
      const products = [
        {
          title: 'Product',
          description: 'Product description',
          price: 50,
          category: 'category 1',
          subcategory: 'subcategory 1',
          images: ['image1', 'image2'],
        },
      ];
      mockProductModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(products),
      });

      const result = await service.findListOfProducts();
      expect(result).toEqual(products);
      expect(mockProductModel.find).toHaveBeenCalled();
    });
  });

  describe('findProductsBySubcategory', () => {
    it('should return products by subcategory', async () => {
      const subcategoryId = 'subcategory1';
      const products = [
        {
          title: 'Product',
          description: 'Product description',
          price: 50,
          category: 'category 1',
          subcategory: subcategoryId,
          images: ['image1', 'image2'],
        },
      ];
      mockProductModel.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(products),
      });

      const result = await service.findProductsBySubcategory(subcategoryId);
      expect(result).toEqual(products);
      expect(mockProductModel.find).toHaveBeenCalledWith({ subcategory: subcategoryId });
    });
  });

  describe('findProductById', () => {
    it('should return a product by id', async () => {
      const productId = new Types.ObjectId().toHexString();
      const product = [
        {
          title: 'Product',
          description: 'Product description',
          price: 50,
          category: 'category 1',
          subcategory: 'subcategory 1',
          images: ['image1', 'image2'],
        },
      ];
      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      const result = await service.findProductById(productId);
      expect(result).toEqual({ product });
      expect(mockProductModel.findById).toHaveBeenCalledWith(productId);
    });

    it('should throw an error if id is invalid', async () => {
      const productId = 'invalid-id';
      await expect(service.findProductById(productId)).rejects.toThrow(
        new HttpException('Invalid product id', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error if product not found', async () => {
      const productId = new Types.ObjectId().toHexString();
      mockProductModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findProductById(productId)).rejects.toThrow(
        new HttpException(`No product with ${productId} id`, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getProductsByQuery', () => {
    it('should return products matching the query', async () => {
      const query = 'Product';
      const products = [
        {
          title: 'Product',
          description: 'Product description',
          price: 50,
          category: 'category 1',
          subcategory: 'subcategory 1',
          images: ['image1', 'image2'],
        },
      ];
      mockProductModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(products),
      });

      const result = await service.getProductsByQuery(query);
      expect(result).toEqual(products);
      expect(mockProductModel.find).toHaveBeenCalledWith(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } },
      );
    });

    it('should throw an error if query is empty', async () => {
      await expect(service.getProductsByQuery('')).rejects.toThrow(
        new HttpException('Search query is required', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('deleteProductById', () => {
    it('should delete a product by id', async () => {
      const productId = new Types.ObjectId().toHexString();
      const product = [
        {
          title: 'Product',
          description: 'Product description',
          price: 50,
          category: 'category 1',
          subcategory: 'subcategory 1',
          images: ['image1', 'image2'],
        },
      ];
      mockProductModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      const result = await service.deleteProductById(productId);
      expect(result).toEqual(product);
      expect(mockProductModel.findByIdAndDelete).toHaveBeenCalledWith(productId);
    });

    it('should throw an error if product not found', async () => {
      const productId = new Types.ObjectId().toHexString();
      mockProductModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteProductById(productId)).rejects.toThrow(
        new HttpException(`No product with ${productId} id`, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateProductById', () => {
    it('should update a product by id', async () => {
      const productId = new Types.ObjectId().toHexString();
      const updateProductDto: UpdateProductDto = {
        title: 'Updated Product',
        description: 'Updated description',
        price: 50,
        category: 'category 1',
        subcategory: 'subcategory 1',
        images: ['image1', 'image2'],
      };
      const product = { productId, ...updateProductDto };
      mockProductModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      const result = await service.updateProductById(productId, updateProductDto);
      expect(result).toEqual(product);
      expect(mockProductModel.findByIdAndUpdate).toHaveBeenCalledWith(productId, updateProductDto, {
        new: true,
      });
    });

    it('should throw an error if product not found', async () => {
      const productId = new Types.ObjectId().toHexString();
      const updateProductDto: UpdateProductDto = {
        title: 'Updated Product',
        description: 'Updated description',
        price: 50,
        category: 'category 1',
        subcategory: 'subcategory 1',
        images: ['image1', 'image2'],
      };
      mockProductModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateProductById(productId, updateProductDto)).rejects.toThrow(
        new HttpException(`No product with ${productId} id`, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('buildProductsResponse', () => {
    it('should return products response', () => {
      const products = [
        {
          title: 'Product',
          description: 'Product description',
          price: 50,
          category: 'category 1',
          subcategory: 'subcategory 1',
          images: ['image1', 'image2'],
        },
      ] as unknown as ProductModel[];
      const result = service.buildProductsResponse(products);

      expect(result).toEqual({ products });
    });
  });
});
