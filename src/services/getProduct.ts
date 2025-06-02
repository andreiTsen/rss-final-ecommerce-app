import { ProductProjection } from '@commercetools/platform-sdk';
import { customerApiRoot } from './customerApi';
import productAboutPage from '../pages/productAboutPage/productAboutPage';

export async function getProduct(key: string): Promise<ProductProjection | undefined> {
  try {
    const api = await customerApiRoot.productProjections().withKey({ key }).get().execute();
    return api.body;
  } catch (error) {
    console.error(error);
  }
}

export async function handleProductAbout(appContainer: HTMLElement): Promise<void> {
  const parameters = new URLSearchParams(window.location.search);
  const key = parameters.get('key');
  try {
    if (key) {
      const product = await getProduct(key);
      if (product) {
        let category = '';
        if (product.categories && product.categories.length > 0) {
          category = await getCategoryNameById(product.categories[0].id);
        }
        const title = product.name?.['en-US'] || 'Без названия';
        const info = product.masterVariant?.attributes?.[1].value || 'Нет описания';
        const priceCent = product.masterVariant.prices?.[0]?.value?.centAmount ?? 0;
        const pages = product.masterVariant?.attributes?.[2].value;
        const price = (priceCent / 100).toFixed(2);
        let discountedPrice: string = '';
        if (product.masterVariant.prices?.[0].discounted?.value?.centAmount) {
          discountedPrice = (product.masterVariant.prices?.[0].discounted?.value?.centAmount / 100).toFixed(2);
        }
        const img = product.masterVariant?.images?.map((img) => img.url) || [];
        const author = product.masterVariant?.attributes?.[0].value;
        new productAboutPage(appContainer, title, info, price, img, category, author, discountedPrice, pages);
      } else {
        appContainer.textContent = 'Ошибка загрузки информации о продукте';
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function getCategoryNameById(id: string): Promise<string> {
  try {
    const response = await customerApiRoot.categories().withId({ ID: id }).get().execute();
    return response.body.name['en-US'];
  } catch (error) {
    console.error(error);
    return 'not category';
  }
}
