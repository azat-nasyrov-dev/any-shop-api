import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductModel } from './models/product.model';
import { ProductsResponseInterface } from './types/products-response.interface';
import { ProductResponseInterface } from './types/product-response.interface';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async createProduct(@Body() createProductDto: CreateProductDto): Promise<ProductModel> {
    return await this.productsService.createProduct(createProductDto);
  }

  @Get()
  public async findListOfProducts(): Promise<ProductsResponseInterface> {
    const products = await this.productsService.findListOfProducts();
    return this.productsService.buildProductsResponse(products);
  }

  @Get('/bySubcategory')
  public async findProductsBySubcategory(
    @Query('subcategory') subcategoryId: string,
  ): Promise<ProductsResponseInterface> {
    const products = await this.productsService.findProductsBySubcategory(subcategoryId);
    return this.productsService.buildProductsResponse(products);
  }

  @Get('/product/:id')
  public async findProductById(@Param('id') id: string): Promise<ProductResponseInterface> {
    return await this.productsService.findProductById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  public async deleteProductById(@Param('id') id: string): Promise<ProductModel | null> {
    return await this.productsService.deleteProductById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async updateProductById(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductModel | null> {
    return await this.productsService.updateProductById(id, updateProductDto);
  }
}
