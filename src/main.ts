import './pages/RegistrationPage/registration.css';
import { RegistrationPage } from './pages/RegistrationPage/registration';
import { AuthService } from './services/authService';
import { Navigation } from './components/navigation';
import loginPage from './pages/loginPage/loginPage';
import { AuthorizationService } from './services/authentication';
import productAboutPage from './pages/productAboutPage/productAboutPage';
import { getProduct } from './services/getProduct';
import './pages/productAboutPage/productAboutPage.css';
import { customerApiRoot } from './services/customerApi';
// const appRoot = document.body;

let appContainer: HTMLElement;
let navigation: Navigation;

document.addEventListener('DOMContentLoaded', () => {
  const existingContainer = document.getElementById('app');
  let navContainer = document.getElementById('nav');
  if (!navContainer) {
    navContainer = document.createElement('header');
    navContainer.id = 'nav';
    document.body.appendChild(navContainer);
  }
  navigation = new Navigation(navContainer);

  if (existingContainer instanceof HTMLElement) {
    appContainer = existingContainer;
  } else {
    appContainer = document.createElement('main');
    appContainer.id = 'app';
    document.body.appendChild(appContainer);
  }

  setupRouting();
});

function setupRouting(): void {
  handleRouting();
  window.addEventListener('popstate', handleRouting);
}

function handleRouting(): void {
  const path = window.location.pathname;
  const isAuthenticated = AuthorizationService.isAuthenticated();

  appContainer.innerHTML = '';

  switch (path) {
    case '/registration':
    case '/register':
      if (!isAuthenticated) {
        new RegistrationPage(appContainer);
      } else {
        navigateTo('/store');
      }
      break;

    case '/login':
      if (!isAuthenticated) {
        new loginPage(appContainer);
      } else {
        navigateTo('/store');
      }
      break;

    case '/product-about': {
      void handleProductAbout();
      break;
    }

    case '/store':
      renderPlaceholderPage('Страница магазина', isAuthenticated);
      break;

    default:
      renderPlaceholderPage('Oшибка 404. Страница не найдена', isAuthenticated);
      break;
  }
  navigation.setActiveLink(path);
}

export function navigateTo(path: string): void {
  window.history.pushState({}, '', path);
  handleRouting();
}

async function handleProductAbout(): Promise<void> {
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
        const info = product.description?.['en-US'] || 'Нет описания';
        const price = String(product.masterVariant.prices?.[0]?.value?.centAmount);
        const img = product.masterVariant?.images?.map((img) => img.url) || [];
        const author = product.masterVariant?.attributes?.[0].value;
        console.log(product);
        new productAboutPage(appContainer, title, info, price, img, category, author);
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

function createPlaceholderContainer(pageName: string): HTMLDivElement {
  const pageContainer = document.createElement('div');
  pageContainer.className = 'placeholder-container';

  const storeTitle = document.createElement('h1');
  storeTitle.className = 'store-title';
  storeTitle.textContent = 'Crazy Bookstore';
  pageContainer.appendChild(storeTitle);

  const pageMessage = document.createElement('p');
  pageMessage.className = 'page-message';
  pageMessage.textContent = pageName;
  pageContainer.appendChild(pageMessage);

  return pageContainer;
}

function createAuthenticatedContent(container: HTMLDivElement, pageName: string): void {
  if (pageName !== 'Страница магазина') return;

  const user = AuthorizationService.getCurrentUser();

  const welcomeMessage = document.createElement('p');
  welcomeMessage.className = 'welcome-message';
  welcomeMessage.textContent = `Добро пожаловать, ${user?.firstName || 'пользователь'}! Вы вошли в систему.`;
  container.appendChild(welcomeMessage);
  const buttonProducts = document.createElement('button');
  buttonProducts.textContent = 'Подробная информация о продукте';
  buttonProducts.setAttribute('data-key', 'atomic-habits');
  buttonProducts.addEventListener('click', () => {
    const key = buttonProducts.getAttribute('data-key');
    if (key) {
      navigateTo(`/product-about?key=${encodeURIComponent(key)}`);
    }
  });
  container.appendChild(buttonProducts);

  const logoutButton = document.createElement('button');
  logoutButton.className = 'logout-button';
  logoutButton.textContent = 'Выйти из учетной записи';
  logoutButton.addEventListener('click', () => {
    AuthorizationService.logout();
    navigation.render();
    navigateTo('/');
  });

  container.appendChild(logoutButton);
}

function createUnauthenticatedContent(container: HTMLDivElement): void {
  const authLinks = document.createElement('div');
  authLinks.className = 'auth-links';

  const registerLink = document.createElement('a');
  registerLink.href = '/registration';
  registerLink.textContent = 'Регистрация';
  registerLink.className = 'auth-link';
  registerLink.addEventListener('click', (event) => {
    event.preventDefault();
    navigateTo('/registration');
  });

  const separator = document.createTextNode(' | ');

  const loginLink = document.createElement('a');
  loginLink.href = '/login';
  loginLink.textContent = 'Вход';
  loginLink.className = 'auth-link';
  loginLink.addEventListener('click', (event) => {
    event.preventDefault();
    navigateTo('/login');
  });

  authLinks.appendChild(registerLink);
  authLinks.appendChild(separator);
  authLinks.appendChild(loginLink);

  container.appendChild(authLinks);
}

function renderPlaceholderPage(pageName: string, isAuthenticated: boolean): void {
  appContainer.textContent = '';
  const container = createPlaceholderContainer(pageName);

  if (isAuthenticated) {
    createAuthenticatedContent(container, pageName);
    navigation.render();
  } else {
    createUnauthenticatedContent(container);
  }

  appContainer.appendChild(container);
}
