import { apiRoot } from './api';
import { Category, ProductProjection, Product } from '@commercetools/platform-sdk';
import { Navigation } from './components/navigation';

const appRoot = document.body
const navigation = new Navigation(appRoot);

//Это тестовый функціонал для проверкі работы апі. Этот модуль должен содержать только інстансы классов. Этот функціонал нужно удаліть прі разработке но прімеры функцій понадобятся в разработке для полученія данные із апі
function getCategoryName(category: Category): string {
  return category.name['en-US'] || category.name['en'] || Object.values(category.name)[0] || 'Без названія';
}

function getProductName(product: Partial<ProductProjection>): string {
  return product.name?.['en-US'] || product.name?.['en'] || Object.values(product.name || {})[0] || 'Названій нет';
}

function getFullProductName(product: Product): string {
  return (
    product.masterData?.current?.name?.['en-US'] ||
    product.masterData?.staged?.name?.['en-US'] ||
    product.masterData?.current?.name?.['en'] ||
    product.masterData?.staged?.name?.['en'] ||
    'Названій нет'
  );
}

function displayCategories(categories: Category[]): void {
  const categoriesContainer = document.createElement('div');
  categoriesContainer.innerHTML = '<h2>Категории:</h2>';

  const categoriesList = document.createElement('ul');
  categories.forEach((category) => {
    const name = getCategoryName(category);

    const listItem = document.createElement('li');
    listItem.textContent = name;
    categoriesList.appendChild(listItem);
  });

  categoriesContainer.appendChild(categoriesList);
  document.body.appendChild(categoriesContainer);
}

function displayProducts(products: Array<Partial<ProductProjection>>): void {
  const productsContainer = document.createElement('div');
  productsContainer.innerHTML = '<h2>Продукты:</h2>';

  if (products.length === 0) {
    productsContainer.innerHTML += '<p>Продукты не найдены.</p>';
    document.body.appendChild(productsContainer);
    return;
  }

  const productsList = document.createElement('ul');
  products.forEach((product) => {
    console.log('Подготовка:', product);
    const name = getProductName(product);

    const listItem = document.createElement('li');
    listItem.textContent = name;
    productsList.appendChild(listItem);
  });

  productsContainer.appendChild(productsList);
  document.body.appendChild(productsContainer);
}

function adaptProductToProjection(product: Product): Partial<ProductProjection> {
  return {
    id: product.id,
    name: product.masterData?.current?.name || product.masterData?.staged?.name || {},
  };
}

async function fetchCategories(statusElement: HTMLElement | null): Promise<Category[]> {
  if (statusElement) {
    statusElement.textContent = 'Загрузка...';
  }

  const categoriesResponse = await apiRoot.categories().get().execute();

  console.log('Категории получены:');
  console.log(`Колічество категорий: ${categoriesResponse.body.total || 0}`);

  console.log('Названия категорий:');
  categoriesResponse.body.results.forEach((category) => {
    console.log(`- ${getCategoryName(category)}`);
  });

  return categoriesResponse.body.results;
}

async function fetchProductProjections(): Promise<ProductProjection[]> {
  const productsResponse = await apiRoot.productProjections().get().execute();

  console.log('Продукты получены');
  console.log(`Колічество продуктов: ${productsResponse.body.total || 0}`);
  console.log('Ответ API:', productsResponse.body);

  return productsResponse.body.results;
}

async function fetchProducts(): Promise<Product[]> {
  const productsResponse = await apiRoot.products().get().execute();

  console.log('Продукты получены:');
  console.log(`Колічествоп родуктов: ${productsResponse.body.total || 0}`);
  console.log('Полный із API:', productsResponse.body);

  return productsResponse.body.results;
}

async function handleFullProducts(
  products: Product[],
  categories: Category[],
  statusElement: HTMLElement | null
): Promise<void> {
  if (products.length > 0) {
    console.log('Названия продуктов');
    products.forEach((product) => {
      console.log(`- ${getFullProductName(product)}`);
    });

    if (statusElement) {
      statusElement.textContent = 'Данные загружены';
    }

    displayCategories(categories);

    const adaptedProducts = products.map(adaptProductToProjection);

    displayProducts(adaptedProducts);
  }
}

async function handleProductProjections(
  productProjections: ProductProjection[],
  categories: Category[],
  statusElement: HTMLElement | null
): Promise<void> {
  console.log('Названия продуктов');
  productProjections.forEach((product) => {
    console.log(`- ${getProductName(product)}`);
  });

  if (statusElement) {
    statusElement.textContent = 'Данные загружены';
  }

  displayCategories(categories);
  displayProducts(productProjections);
}

function handleProductError(error: unknown, statusElement: HTMLElement | null, categories: Category[]): void {
  console.error('Ошибка запроса:', error);

  if (statusElement) {
    statusElement.textContent = 'Ошибка полученія продуктов';
  }

  displayCategories(categories);

  const errorContainer = document.createElement('div');
  errorContainer.innerHTML = '<h2>Продукты:</h2>';
  document.body.appendChild(errorContainer);
}

function handleGeneralError(error: unknown, statusElement: HTMLElement | null): void {
  console.error('Ошибка Commercetools:', error);

  if (error && typeof error === 'object') {
    if ('statusCode' in error) {
      console.error(`Ошибка: ${error.statusCode}`);
    }

    if ('message' in error) {
      console.error(`Ошібка: ${error.message}`);
    }
  }

  if (statusElement) {
    statusElement.textContent = 'Ошибка';
  }
}

async function fetchAndProcessProducts(categories: Category[], statusElement: HTMLElement | null): Promise<void> {
  if (statusElement) {
    statusElement.textContent = 'Загрузка...';
  }

  try {
    const productProjections = await fetchProductProjections();

    if (productProjections.length === 0) {
      console.log('Ошібка полученія продуктов');

      const products = await fetchProducts();

      if (products.length > 0) {
        await handleFullProducts(products, categories, statusElement);
        return;
      }
    }

    await handleProductProjections(productProjections, categories, statusElement);
  } catch (productError) {
    handleProductError(productError, statusElement, categories);
  }
}

async function fetchAndDisplayData(): Promise<void> {
  const statusElement = document.getElementById('status');

  try {
    const categories = await fetchCategories(statusElement);

    await fetchAndProcessProducts(categories, statusElement);
  } catch (error: unknown) {
    handleGeneralError(error, statusElement);
  }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayData);
