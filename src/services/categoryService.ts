import { apiRoot } from '../api';
import { Category } from '@commercetools/platform-sdk';

export type CategoryData = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  productCount?: number;
};

export class CategoryService {
  private static categoryCache = new Map<string, CategoryData>();

  public static async getCategories(): Promise<CategoryData[]> {
    try {
      const response = await apiRoot
        .categories()
        .get({
          queryArgs: {
            limit: 100,
            sort: 'name.en asc',
            expand: ['parent'],
          },
        })
        .execute();

      const categories = response.body.results.map((category) => this.mapCategoryToData(category));

      categories.forEach((category) => {
        this.categoryCache.set(category.id, category);
      });

      return categories;
    } catch (error) {
      console.error('Ошібка полученія категорий из API:', error);
      return [];
    }
  }

  public static async getCategoryPath(categoryId: string): Promise<CategoryData[]> {
    try {
      const path: CategoryData[] = [];
      let currentCategoryId: string | undefined = categoryId;

      while (currentCategoryId) {
        const category = await this.getCategoryById(currentCategoryId);
        if (!category) break;

        path.unshift(category);
        currentCategoryId = category.parentId;
      }

      return path;
    } catch (error) {
      console.error('Ошибка путі категории:', error);
      return [];
    }
  }

  public static async getCategoryById(categoryId: string): Promise<CategoryData | null> {
    if (this.categoryCache.has(categoryId)) {
      return this.categoryCache.get(categoryId) || null;
    }

    try {
      const response = await apiRoot
        .categories()
        .withId({ ID: categoryId })
        .get({
          queryArgs: {
            expand: ['parent'],
          },
        })
        .execute();

      const categoryData = this.mapCategoryToData(response.body);

      this.categoryCache.set(categoryId, categoryData);

      return categoryData;
    } catch (error) {
      console.error(`Ошібка полученія категорій ${categoryId}:`, error);
      return null;
    }
  }

  public static async getCategoryProductCount(categoryId: string): Promise<number> {
    try {
      const response = await apiRoot
        .productProjections()
        .get({
          queryArgs: {
            limit: 0,
            staged: false,
            where: [`categories(id="${categoryId}")`],
          },
        })
        .execute();

      return response.body.total || 0;
    } catch (error) {
      console.error(`Ошибка при счета ${categoryId}:`, error);
      return 0;
    }
  }

  private static mapCategoryToData(category: Category): CategoryData {
    const categoryName = this.extractCategoryName(category);
    const categorySlug = this.extractCategorySlug(category);
    const categoryDescription = this.extractCategoryDescription(category);
    const parentId = this.extractParentId(category);

    const categoryData: CategoryData = {
      id: category.id,
      name: categoryName,
      slug: categorySlug,
      description: categoryDescription,
      parentId,
    };

    return categoryData;
  }

  private static extractCategoryName(category: Category): string {
    return (
      category.name?.['en-US'] ||
      category.name?.['en'] ||
      category.name?.['ru'] ||
      category.name?.['de-DE'] ||
      category.name?.['de'] ||
      Object.values(category.name || {}).find((name) => name && name.trim() !== '') ||
      'Категория без названия'
    );
  }

  private static extractCategorySlug(category: Category): string {
    return (
      category.slug?.['en-US'] ||
      category.slug?.['en'] ||
      category.slug?.['ru'] ||
      category.slug?.['de-DE'] ||
      category.slug?.['de'] ||
      Object.values(category.slug || {}).find((slug) => slug && slug.trim() !== '') ||
      category.key ||
      category.id
    );
  }

  private static extractCategoryDescription(category: Category): string | undefined {
    return (
      category.description?.['en-US'] ||
      category.description?.['en'] ||
      category.description?.['ru'] ||
      category.description?.['de-DE'] ||
      category.description?.['de'] ||
      Object.values(category.description || {}).find((desc) => desc && desc.trim() !== '')
    );
  }

  private static extractParentId(category: Category): string | undefined {
    return category.parent?.id;
  }
}
