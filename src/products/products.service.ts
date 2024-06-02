import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductModel } from './models/product.model';
import { isValidObjectId, Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseInterface } from './types/product-response.interface';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsResponseInterface } from './types/products-response.interface';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(ProductModel.name)
    private readonly productModel: Model<ProductModel>,
  ) {}

  public async createProduct(createProductDto: CreateProductDto): Promise<ProductModel> {
    const newProduct = await this.productModel.create(createProductDto);
    return await newProduct.save().catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  public async findListOfProducts(): Promise<ProductModel[]> {
    return await this.productModel
      .find()
      .limit(20)
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  public async findProductsBySubcategory(subcategoryId: string): Promise<ProductModel[]> {
    return await this.productModel
      .find({ subcategory: subcategoryId })
      .limit(20)
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  public async findProductById(id: string): Promise<ProductResponseInterface> {
    if (!isValidObjectId(id)) {
      throw new HttpException('Invalid product id', HttpStatus.BAD_REQUEST);
    }

    const product = await this.productModel
      .findById(id)
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!product) {
      throw new HttpException(`No product with ${id} id`, HttpStatus.NOT_FOUND);
    }

    return { product };
  }

  public async getProductsByQuery(query: string): Promise<ProductModel[]> {
    if (!query) {
      throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
    }

    return await this.productModel
      .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .exec();
  }

  public async deleteProductById(id: string): Promise<ProductModel | null> {
    const deletedProduct = await this.productModel
      .findByIdAndDelete(id)
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!deletedProduct) {
      throw new HttpException(`No product with ${id} id`, HttpStatus.NOT_FOUND);
    }

    return deletedProduct;
  }

  public async updateProductById(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductModel | null> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec()
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!updatedProduct) {
      throw new HttpException(`No product with ${id} id`, HttpStatus.NOT_FOUND);
    }

    return updatedProduct;
  }

  public buildProductsResponse(products: ProductModel[]): ProductsResponseInterface {
    return { products };
  }
}
