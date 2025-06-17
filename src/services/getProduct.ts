import { ProductProjection } from '@commercetools/platform-sdk';
import productAboutPage from '../pages/productAboutPage/productAboutPage';
import { apiRoot } from '../api';

export async function getProduct(key: string): Promise<ProductProjection | undefined> {
  try {
    const api = await apiRoot.productProjections().withKey({ key }).get().execute();
    return api.body;
  } catch (error) {
    console.error(error);
  }
}

export async function handleProductAbout(appContainer: HTMLElement): Promise<void> {
  const parameters = new URLSearchParams(window.location.search);
  const key = parameters.get('key');
  try {
    if (!key) return;
    const product = await getProduct(key);
    if (!product) return;

    let category = '';
    if (product.categories?.length > 0) {
      category = await getCategoryNameById(product.categories[0].id);
    }

    const title = product.name?.['en-US'] || 'Без названия';
    const priceCent = product.masterVariant.prices?.[0]?.value?.centAmount ?? 0;
    const price = (priceCent / 100).toFixed(2);
    const discountedCent = product.masterVariant.prices?.[0].discounted?.value?.centAmount;
    const discountedPrice = discountedCent ? (discountedCent / 100).toFixed(2) : '';

    new productAboutPage(
      appContainer,
      title,
      product.masterVariant?.attributes?.[1].value || 'Нет описания',
      price,
      product.masterVariant?.images?.map((img) => img.url) || [],
      category,
      product.masterVariant?.attributes?.[0].value,
      discountedPrice,
      product.masterVariant?.attributes?.[2].value,
      product.id
    );
  } catch (error) {
    appContainer.textContent = 'Ошибка загрузки информации о продукте';
    console.error(error);
  }
}

async function getCategoryNameById(id: string): Promise<string> {
  try {
    const response = await apiRoot.categories().withId({ ID: id }).get().execute();
    return response.body.name['en-US'];
  } catch (error) {
    console.error(error);
    return 'not category';
  }
}
