import { apiRoot } from '../api';
import { Category } from '@commercetools/platform-sdk';

export type CategoryData = {
  id: string;
  name: string;
  slug: string;
};

export class CategoryService {
  public static async getCategories(): Promise<CategoryData[]> {
    try {
      console.log('Загружаем категории...');
      const response = await apiRoot
        .categories()
        .get({
          queryArgs: {
            limit: 50,
          },
        })
        .execute();

      console.log('Ответ категорій API:', response.body);
      console.log('Колічество категорій:', response.body.results.length);

      const categories = response.body.results.map((category) => this.mapCategoryToData(category));
      console.log('Тест категорій:', categories);

      return categories;
    } catch (error) {
      console.error('Ошібка полученія категорий:', error);
      return [];
    }
  }

  private static mapCategoryToData(category: Category): CategoryData {
    console.log('Обрабатываем категорию:', category);

    const categoryName =
      category.name?.['en-US'] ||
      category.name?.['en'] ||
      category.name?.['ru'] ||
      category.name?.['de-DE'] ||
      Object.values(category.name || {}).find((name) => name && name.trim() !== '') ||
      'Без названия';

    const categorySlug =
      category.slug?.['en-US'] ||
      category.slug?.['en'] ||
      category.slug?.['ru'] ||
      category.slug?.['de-DE'] ||
      Object.values(category.slug || {}).find((slug) => slug && slug.trim() !== '') ||
      category.key ||
      '';

    return {
      id: category.id,
      name: categoryName,
      slug: categorySlug,
    };
  }
}
