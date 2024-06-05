import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsResponseInterface } from './types/products-response.interface';
import { ProductModel } from './models/product.model';
import { ProductResponseInterface } from './types/product-response.interface';
import { Types } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    createProduct: jest.fn(),
    findListOfProducts: jest.fn(),
    findProductsBySubcategory: jest.fn(),
    findProductById: jest.fn(),
    getProductsByQuery: jest.fn(),
    deleteProductById: jest.fn(),
    updateProductById: jest.fn(),
    buildProductsResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        title: 'New Product',
        description: 'Product description',
        price: 100,
        category: 'category 1',
        subcategory: 'subcategory 1',
        images: ['image1', 'image2'],
      };
      const product = { ...createProductDto, id: '1' };
      mockProductsService.createProduct.mockResolvedValue(product);

      const result = await controller.createProduct(createProductDto);
      expect(result).toEqual(product);
      expect(mockProductsService.createProduct).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findListOfProducts', () => {
    it('should return a list of products', async () => {
      const products = [
        {
          id: '1',
          title: 'Product',
          description: 'Product description',
          price: 100,
          category: 'category1',
          subcategory: 'subcategory1',
          images: ['image1', 'image2'],
        },
      ] as unknown as ProductModel[];
      const response: ProductsResponseInterface = { products };
      mockProductsService.findListOfProducts.mockResolvedValue(products);
      mockProductsService.buildProductsResponse.mockReturnValue(response);

      const result = await controller.findListOfProducts();
      expect(result).toEqual(response);
      expect(mockProductsService.findListOfProducts).toHaveBeenCalled();
      expect(mockProductsService.buildProductsResponse).toHaveBeenCalledWith(products);
    });
  });

  describe('findProductsBySubcategory', () => {
    it('should return products by subcategory', async () => {
      const subcategoryId = 'subcategory1';
      const products = [
        {
          id: '1',
          title: 'Product',
          description: 'Product description',
          price: 100,
          category: 'category1',
          subcategory: subcategoryId,
          images: ['image1', 'image2'],
        },
      ] as unknown as ProductModel[];
      const response: ProductsResponseInterface = { products };
      mockProductsService.findProductsBySubcategory.mockResolvedValue(products);
      mockProductsService.buildProductsResponse.mockReturnValue(response);

      const result = await controller.findProductsBySubcategory(subcategoryId);
      expect(result).toEqual(response);
      expect(mockProductsService.findProductsBySubcategory).toHaveBeenCalledWith(subcategoryId);
      expect(mockProductsService.buildProductsResponse).toHaveBeenCalledWith(products);
    });
  });

  describe('findProductById', () => {
    it('should return a product by id', async () => {
      const productId = new Types.ObjectId().toHexString();
      const product = {
        id: productId,
        title: 'Product',
        description: 'Product description',
        price: 100,
        category: 'category1',
        subcategory: 'subcategory1',
        images: ['image1', 'image2'],
      } as unknown as ProductModel;
      const response: ProductResponseInterface = { product };
      mockProductsService.findProductById.mockResolvedValue(response);

      const result = await controller.findProductById(productId);
      expect(result).toEqual(result);
      expect(mockProductsService.findProductById).toHaveBeenCalledWith(productId);
    });

    it('should throw an error if product not found', async () => {
      mockProductsService.findProductById.mockImplementation(() => {
        throw new HttpException('No product with 1 id', HttpStatus.NOT_FOUND);
      });

      await expect(controller.findProductById('1')).rejects.toThrow(HttpException);
      await expect(controller.findProductById('1')).rejects.toThrow(
        new HttpException('No product with 1 id', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getProductsByQuery', () => {
    it('should return products matching the query', async () => {
      const query = 'Product';
      const products = [
        {
          id: '1',
          title: 'Product',
          description: 'Product description',
          price: 100,
          category: 'category1',
          subcategory: 'subcategory1',
          images: ['image1', 'image2'],
        },
      ] as unknown as ProductModel[];
      const response: ProductsResponseInterface = { products };
      mockProductsService.getProductsByQuery.mockResolvedValue(products);
      mockProductsService.buildProductsResponse.mockReturnValue(response);

      const result = await controller.getProductsByQuery(query);
      expect(result).toEqual(response);
      expect(mockProductsService.getProductsByQuery).toHaveBeenCalledWith(query);
      expect(mockProductsService.buildProductsResponse).toHaveBeenCalledWith(products);
    });
  });

  describe('deleteProductById', () => {
    it('should delete a product by id', async () => {
      const productId = new Types.ObjectId().toHexString();
      const product = {
        id: productId,
        title: 'Product',
        description: 'Product description',
        price: 100,
        category: 'category1',
        subcategory: 'subcategory1',
        images: ['image1', 'image2'],
      } as unknown as ProductModel;
      mockProductsService.deleteProductById.mockResolvedValue(product);

      const result = await controller.deleteProductById(productId);
      expect(result).toEqual(product);
      expect(mockProductsService.deleteProductById).toHaveBeenCalledWith(productId);
    });

    it('should throw an error if product not found', async () => {
      mockProductsService.deleteProductById.mockImplementation(() => {
        throw new HttpException('No product with 1 id', HttpStatus.NOT_FOUND);
      });

      await expect(controller.deleteProductById('1')).rejects.toThrow(HttpException);
      await expect(controller.deleteProductById('1')).rejects.toThrow(
        new HttpException('No product with 1 id', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateProductById', () => {
    it('should update a product by id', async () => {
      const productId = new Types.ObjectId().toHexString();
      const updateProductDto: UpdateProductDto = {
        title: 'Updated Product',
        description: 'Updated description',
        price: 120,
        category: 'category1',
        subcategory: 'subcategory1',
        images: ['image1', 'image2'],
      };
      const product = { productId, ...updateProductDto };
      mockProductsService.updateProductById.mockResolvedValue(product);

      const result = await controller.updateProductById(productId, updateProductDto);
      expect(result).toEqual(product);
      expect(mockProductsService.updateProductById).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
    });

    it('should throw an error if product not found', async () => {
      const updateProductDto: UpdateProductDto = {
        title: 'Updated Product',
        description: 'Updated description',
        price: 50,
        category: 'category 1',
        subcategory: 'subcategory 1',
        images: ['image1', 'image2'],
      };
      mockProductsService.updateProductById.mockImplementation(() => {
        throw new HttpException('No product with 1 id', HttpStatus.NOT_FOUND);
      });

      await expect(controller.updateProductById('1', updateProductDto)).rejects.toThrow(
        HttpException,
      );
      await expect(controller.updateProductById('1', updateProductDto)).rejects.toThrow(
        new HttpException('No product with 1 id', HttpStatus.NOT_FOUND),
      );
    });
  });
});
