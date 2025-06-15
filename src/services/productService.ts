import { apiRoot } from '../api';
import { ProductProjection, Category, ProductVariant, Attribute } from '@commercetools/platform-sdk';

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

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

export type ProductFilters = {
  categoryId?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  author?: string;
  hasDiscount?: boolean;
  searchText?: string;
  sortBy?: SortOption;
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
  sort?: string[];
  'text.en-US'?: string;
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
      const apiFilters = { ...filters };
      delete apiFilters.sortBy;
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

  public static async getFilterOptions(): Promise<FilterOptions> {
    try {
      const response = await apiRoot
        .productProjections()
        .get({
          queryArgs: {
            limit: 500,
            staged: false,
          },
        })
        .execute();

      const products = await this.processProductsFromResponse(response.body.results);

      return {
        authors: this.extractUniqueAuthors(products),
        priceRange: this.calculatePriceRange(products),
      };
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

    const sortConditions = this.buildSortConditions(filters);
    if (sortConditions.length > 0) {
      queryArguments.sort = sortConditions;
    }

    return queryArguments;
  }

  private static buildWhereConditions(filters?: ProductFilters): string[] {
    if (!filters) return [];

    const whereConditions: string[] = [];

    if (filters.categoryId) {
      whereConditions.push(`categories(id="${filters.categoryId}")`);
    }

    if (filters.hasDiscount) {
      whereConditions.push('masterVariant(prices(discounted is defined))');
    }

    const priceConditions = this.buildPriceConditions(filters.priceRange);
    if (priceConditions) {
      whereConditions.push(priceConditions);
    }

    return whereConditions;
  }

  private static buildPriceConditions(priceRange?: { min?: number; max?: number }): string | null {
    if (!priceRange) return null;

    const { min, max } = priceRange;

    if (min !== undefined && max !== undefined) {
      const minCents = Math.round(min * 100);
      const maxCents = Math.round(max * 100);
      return `masterVariant(prices(value(centAmount >= ${minCents} and centAmount <= ${maxCents})))`;
    }

    if (min !== undefined) {
      const minCents = Math.round(min * 100);
      return `masterVariant(prices(value(centAmount >= ${minCents})))`;
    }

    if (max !== undefined) {
      const maxCents = Math.round(max * 100);
      return `masterVariant(prices(value(centAmount <= ${maxCents})))`;
    }

    return null;
  }

  private static buildSortConditions(filters?: ProductFilters): string[] {
    if (!filters?.sortBy || !this.isServerSort(filters.sortBy)) {
      return [];
    }

    return this.buildSortQueries(filters.sortBy);
  }

  private static isServerSort(sortBy: SortOption): boolean {
    return sortBy === 'name-asc' || sortBy === 'name-desc';
  }

  private static buildSortQueries(sortBy: SortOption): string[] {
    switch (sortBy) {
      case 'name-asc':
        return ['name.en-US asc'];
      case 'name-desc':
        return ['name.en-US desc'];
      case 'price-asc':
      case 'price-desc':
        return [];
      default:
        return ['createdAt desc'];
    }
  }

  private static async processProductsFromResponse(products: ProductProjection[]): Promise<ProductData[]> {
    return Promise.all(products.map((product) => this.mapProductToData(product)));
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

  private static applyClientSideFilters(products: ProductData[], filters?: ProductFilters): ProductData[] {
    if (!filters) return products;

    let filteredProducts = [...products];

    if (filters.searchText) {
      filteredProducts = this.applySearchFilter(filteredProducts, filters.searchText);
    }

    if (filters.author) {
      filteredProducts = this.applyAuthorFilter(filteredProducts, filters.author);
    }

    if (filters.sortBy === 'price-asc' || filters.sortBy === 'price-desc') {
      filteredProducts = this.applySorting(filteredProducts, filters.sortBy);
    }

    return filteredProducts;
  }

  private static applySorting(products: ProductData[], sortBy: SortOption): ProductData[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }

  private static applySearchFilter(products: ProductData[], searchText: string): ProductData[] {
    const searchLower = searchText.toLowerCase().trim();
    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
      const authorMatch = product.author?.toLowerCase().includes(searchLower);
      const categoryMatch = product.category?.toLowerCase().includes(searchLower);
      return nameMatch || descriptionMatch || authorMatch || categoryMatch;
    });
  }

  private static applyAuthorFilter(products: ProductData[], author: string): ProductData[] {
    const authorLower = author.toLowerCase();
    return products.filter((product) => product.author?.toLowerCase().includes(authorLower));
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

    attributes.forEach((attribute: Attribute) => {
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
