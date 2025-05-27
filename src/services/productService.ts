import { apiRoot } from '../api';
import { ProductProjection, Category, ProductVariant } from '@commercetools/platform-sdk';

export type ProductData = {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category?: string;
  hasDiscount: boolean;
};

export class ProductService {
  private static categoryCache = new Map<string, string>();

  public static async getProducts(limit: number = 12): Promise<ProductData[]> {
    try {
      console.log('Загружаем продукты...');
      const response = await apiRoot
        .productProjections()
        .get({
          queryArgs: {
            limit,
            staged: false,
          },
        })
        .execute();

      console.log('Ответ API:', response.body);
      console.log('Колічество продуктов:', response.body.results.length);

      const products = await Promise.all(response.body.results.map((product) => this.mapProductToData(product)));

      console.log('Тест продуктов:', products);
      return products;
    } catch (error) {
      console.error('Ошібка при получении продуктов:', error);
      return [];
    }
  }

  public static async getProductsByCategory(categoryId: string, limit: number = 12): Promise<ProductData[]> {
    try {
      console.log('Загрузка продуктов по категоріі:', categoryId);

      const response = await apiRoot
        .productProjections()
        .get({
          queryArgs: {
            limit: 100,
            staged: false,
          },
        })
        .execute();

      const filteredProducts = response.body.results.filter((product) =>
        product.categories?.some((category) => category.id === categoryId)
      );

      const limitedProducts = filteredProducts.slice(0, limit);

      const products = await Promise.all(limitedProducts.map((product) => this.mapProductToData(product)));

      console.log('Продукты по категоріі:', products);
      return products;
    } catch (error) {
      console.error('Ошібка полученія продуктов по категоріі:', error);
      return [];
    }
  }

  private static async mapProductToData(product: ProductProjection): Promise<ProductData> {
    const variant = product.masterVariant;
    console.log('Тест продукта:', product.name);

    const priceInfo = this.extractPriceInfo(variant);
    const productName = this.extractProductName(product);
    const description = this.extractProductDescription(product);
    const categoryName = await this.extractCategoryName(product);

    return {
      id: product.id,
      name: productName,
      description,
      price: priceInfo.finalPrice,
      originalPrice: priceInfo.hasDiscount ? priceInfo.currentPrice : undefined,
      imageUrl: variant.images?.[0]?.url,
      category: categoryName,
      hasDiscount: priceInfo.hasDiscount,
    };
  }

  private static extractPriceInfo(variant: ProductVariant): {
    currentPrice: number;
    finalPrice: number;
    hasDiscount: boolean;
  } {
    const price = variant.prices?.[0];
    const currentPrice = price?.value.centAmount ? price.value.centAmount / 100 : 0;
    const discountedPrice = price?.discounted?.value.centAmount;
    const hasDiscount = !!discountedPrice;
    const finalPrice = hasDiscount ? discountedPrice / 100 : currentPrice;

    return {
      currentPrice,
      finalPrice,
      hasDiscount,
    };
  }

  private static extractProductName(product: ProductProjection): string {
    return (
      product.name?.['en-US'] ||
      product.name?.['en'] ||
      product.name?.['ru'] ||
      product.name?.['de-DE'] ||
      Object.values(product.name || {})[0] ||
      'Без названия'
    );
  }

  private static extractProductDescription(product: ProductProjection): string | undefined {
    return (
      product.description?.['en-US'] ||
      product.description?.['en'] ||
      product.description?.['ru'] ||
      product.description?.['de-DE'] ||
      Object.values(product.description || {})[0]
    );
  }

  private static async extractCategoryName(product: ProductProjection): Promise<string> {
    const categoryId = product.categories?.[0]?.id;
    return categoryId ? (await this.getCategoryName(categoryId)) || 'Без категории' : 'Без категории';
  }

  private static async getCategoryName(categoryId: string): Promise<string | undefined> {
    if (this.categoryCache.has(categoryId)) {
      return this.categoryCache.get(categoryId);
    }

    try {
      const response = await apiRoot.categories().withId({ ID: categoryId }).get().execute();

      const category: Category = response.body;
      const name = this.extractCategoryNameFromCategory(category);

      if (name) {
        this.categoryCache.set(categoryId, name);
      }

      return name;
    } catch (error) {
      console.error(`Ошібка полученія категоріі ${categoryId}:`, error);
      return 'Без категории';
    }
  }

  private static extractCategoryNameFromCategory(category: Category): string {
    return (
      category.name?.['en-US'] ||
      category.name?.['en'] ||
      category.name?.['ru'] ||
      category.name?.['de-DE'] ||
      Object.values(category.name || {})[0] ||
      'Без названія'
    );
  }
}
