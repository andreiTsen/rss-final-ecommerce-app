import { apiRoot } from '../api';
import {
  ProductProjection,
  Category,
  ProductVariant,
  ClientResponse,
  ProductProjectionPagedQueryResponse,
} from '@commercetools/platform-sdk';

export type ProductData = {
  id: string;
  key?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category?: string;
  hasDiscount: boolean;
  discountPercentage?: number;
  discountAmount?: number;
  author?: string;
  attributes?: Record<string, unknown>;
};

export type ProductFilters = {
  categoryId?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  author?: string;
  hasDiscount?: boolean;
  searchText?: string;
};

export type FilterOptions = {
  authors: string[];
  priceRange: {
    min: number;
    max: number;
  };
};

type QueryArguments = {
  limit: number;
  staged: boolean;
  expand: string[];
  where?: string[];
};

type PriceInfo = {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercentage?: number;
  discountAmount?: number;
};

type ProductAttributes = {
  author?: string;
  raw: Record<string, unknown>;
};

export class ProductService {
  private static categoryCache = new Map<string, string>();

  public static async getProducts(limit: number = 12, filters?: ProductFilters): Promise<ProductData[]> {
    try {
      const queryArguments = this.buildQueryArguments(limit, filters);

      const response = await apiRoot
        .productProjections()
        .get({
          queryArgs: queryArguments,
        })
        .execute();

      const products = await this.processProductsFromResponse(response.body.results);
      const filteredProducts = this.applyClientSideFilters(products, filters);

      return filteredProducts;
    } catch (error) {
      console.error('Ошібка полученія продуктов из API commercetools:', error);
      return [];
    }
  }

  public static async getProductsByCategory(
    categoryId: string,
    limit: number = 12,
    filters?: ProductFilters
  ): Promise<ProductData[]> {
    const categoryFilters: ProductFilters = {
      ...filters,
      categoryId,
    };

    return this.getProducts(limit, categoryFilters);
  }

  public static async getFilterOptions(): Promise<FilterOptions> {
    try {
      const response = await this.fetchAllProductsForFilters();

      const products = await this.processProductsFromResponse(response.body.results);
      const filterOptions = this.extractFilterOptionsFromProducts(products);

      return filterOptions;
    } catch (error) {
      console.error('Ошибка полученія опцій фільтров:', error);
      return {
        authors: [],
        priceRange: { min: 0, max: 10000 },
      };
    }
  }

  private static buildQueryArguments(limit: number, filters?: ProductFilters): QueryArguments {
    const queryArguments: QueryArguments = {
      limit,
      staged: false,
      expand: ['categories[*]'],
    };

    const whereConditions = this.buildWhereConditions(filters);
    if (whereConditions.length > 0) {
      queryArguments.where = whereConditions;
    }

    return queryArguments;
  }

  private static async processProductsFromResponse(products: ProductProjection[]): Promise<ProductData[]> {
    return Promise.all(products.map((product) => this.mapProductToData(product)));
  }

  private static async fetchAllProductsForFilters(): Promise<ClientResponse<ProductProjectionPagedQueryResponse>> {
    return apiRoot
      .productProjections()
      .get({
        queryArgs: {
          limit: 500,
          staged: false,
          expand: ['categories[*]'],
        },
      })
      .execute();
  }

  private static extractFilterOptionsFromProducts(products: ProductData[]): FilterOptions {
    const authors = this.extractUniqueAuthors(products);
    const priceRange = this.calculatePriceRange(products);

    return {
      authors,
      priceRange,
    };
  }

  private static extractUniqueAuthors(products: ProductData[]): string[] {
    const authorSet = new Set<string>();

    products.forEach((product) => {
      if (product.author && product.author.trim() !== '') {
        authorSet.add(product.author);
      }
    });

    const authors = Array.from(authorSet).sort();
    return authors;
  }

  private static calculatePriceRange(products: ProductData[]): { min: number; max: number } {
    const prices = products.map((product) => product.price).filter((price) => price > 0);

    const priceRange = {
      min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000,
    };

    return priceRange;
  }

  private static buildWhereConditions(filters?: ProductFilters): string[] {
    if (!filters) {
      return [];
    }

    const conditions: string[] = [];

    if (filters.categoryId) {
      conditions.push(`categories(id="${filters.categoryId}")`);
    }

    if (filters.hasDiscount) {
      conditions.push('masterVariant(prices(discounted is defined))');
    }

    return conditions;
  }

  private static applyClientSideFilters(products: ProductData[], filters?: ProductFilters): ProductData[] {
    if (!filters) {
      return products;
    }

    let filteredProducts = [...products];

    filteredProducts = this.applySearchFilter(filteredProducts, filters.searchText);
    filteredProducts = this.applyPriceRangeFilter(filteredProducts, filters.priceRange);
    filteredProducts = this.applyAuthorFilter(filteredProducts, filters.author);

    return filteredProducts;
  }

  private static applySearchFilter(products: ProductData[], searchText?: string): ProductData[] {
    if (!searchText || !searchText.trim()) return products;

    const searchTextLower = searchText.toLowerCase().trim();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTextLower) ||
        (product.description && product.description.toLowerCase().includes(searchTextLower)) ||
        (product.author && product.author.toLowerCase().includes(searchTextLower))
    );

    return filtered;
  }

  private static applyPriceRangeFilter(
    products: ProductData[],
    priceRange?: { min?: number; max?: number }
  ): ProductData[] {
    if (!priceRange) return products;

    const { min, max } = priceRange;
    const filtered = products.filter((product) => {
      if (min !== undefined && product.price < min) return false;
      if (max !== undefined && product.price > max) return false;
      return true;
    });

    return filtered;
  }

  private static applyAuthorFilter(products: ProductData[], author?: string): ProductData[] {
    if (!author) return products;

    const filtered = products.filter(
      (product) => product.author && product.author.toLowerCase().includes(author.toLowerCase())
    );

    return filtered;
  }

  private static async mapProductToData(product: ProductProjection): Promise<ProductData> {
    const variant = product.masterVariant;

    const priceInfo = this.extractPriceInfo(variant);
    const productName = this.extractProductName(product);
    const description = this.extractProductDescription(product);
    const imageUrl = this.extractProductImage(variant);
    const categoryName = await this.extractCategoryName(product);
    const attributes = this.extractProductAttributes(variant);

    return {
      id: product.id,
      key: product.key,
      name: productName,
      description,
      price: priceInfo.finalPrice,
      originalPrice: priceInfo.hasDiscount ? priceInfo.originalPrice : undefined,
      imageUrl,
      category: categoryName,
      hasDiscount: priceInfo.hasDiscount,
      discountPercentage: priceInfo.discountPercentage,
      discountAmount: priceInfo.discountAmount,
      author: attributes.author,
      attributes: attributes.raw,
    };
  }

  private static extractProductAttributes(variant: ProductVariant): ProductAttributes {
    const attributes = variant.attributes || [];
    const attributeMap: Record<string, unknown> = {};

    attributes.forEach((attribute) => {
      if (attribute.name && attribute.value !== undefined) {
        attributeMap[attribute.name] = attribute.value;
      }
    });

    const author = this.findAuthorFromAttributes(attributeMap);

    return {
      author: author || undefined,
      raw: attributeMap,
    };
  }

  private static findAuthorFromAttributes(attributeMap: Record<string, unknown>): string | undefined {
    const authorKeys = ['author', 'writer', 'authorName', 'author-name', 'bookAuthor'];

    for (const key of authorKeys) {
      const value = attributeMap[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
    }

    return undefined;
  }

  private static extractPriceInfo(variant: ProductVariant): PriceInfo {
    const price = variant.prices?.[0];

    if (!price) {
      return this.createEmptyPriceInfo();
    }

    const originalPriceInCents = price.value.centAmount;
    const originalPrice = originalPriceInCents / 100;
    const discountedPriceInCents = price.discounted?.value.centAmount;

    if (discountedPriceInCents) {
      return this.createDiscountedPriceInfo(originalPrice, discountedPriceInCents);
    }

    return this.createRegularPriceInfo(originalPrice);
  }

  private static createEmptyPriceInfo(): PriceInfo {
    return {
      originalPrice: 0,
      finalPrice: 0,
      hasDiscount: false,
    };
  }

  private static createDiscountedPriceInfo(originalPrice: number, discountedPriceInCents: number): PriceInfo {
    const finalPrice = discountedPriceInCents / 100;
    const discountPercentage = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
    const discountAmount = originalPrice - finalPrice;

    return {
      originalPrice,
      finalPrice,
      hasDiscount: true,
      discountPercentage,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  }

  private static createRegularPriceInfo(originalPrice: number): PriceInfo {
    return {
      originalPrice,
      finalPrice: originalPrice,
      hasDiscount: false,
    };
  }

  private static extractProductName(product: ProductProjection): string {
    const name =
      product.name?.['en-US'] ||
      product.name?.['en'] ||
      product.name?.['ru'] ||
      product.name?.['de-DE'] ||
      Object.values(product.name || {})[0];

    return name || 'Продукт без названия';
  }

  private static extractProductDescription(product: ProductProjection): string {
    const description =
      product.description?.['en-US'] ||
      product.description?.['en'] ||
      product.description?.['ru'] ||
      product.description?.['de-DE'] ||
      Object.values(product.description || {})[0];

    return description || 'Опісаніе отсутствует';
  }

  private static extractProductImage(variant: ProductVariant): string | undefined {
    return variant.images?.[0]?.url;
  }

  private static async extractCategoryName(product: ProductProjection): Promise<string> {
    const categoryId = product.categories?.[0]?.id;
    if (!categoryId) return 'Без категории';

    const categoryName = await this.getCategoryName(categoryId);
    return categoryName || 'Без категории';
  }

  private static async getCategoryName(categoryId: string): Promise<string | undefined> {
    if (this.categoryCache.has(categoryId)) {
      return this.categoryCache.get(categoryId);
    }

    try {
      const response = await apiRoot.categories().withId({ ID: categoryId }).get().execute();

      const category: Category = response.body;
      const name =
        category.name?.['en-US'] ||
        category.name?.['en'] ||
        category.name?.['ru'] ||
        category.name?.['de-DE'] ||
        Object.values(category.name || {})[0] ||
        'Без названия';

      if (name) {
        this.categoryCache.set(categoryId, name);
      }

      return name;
    } catch (error) {
      console.error(`Ошібка полученія категоріі ${categoryId}:`, error);
      return 'Без категории';
    }
  }
}
