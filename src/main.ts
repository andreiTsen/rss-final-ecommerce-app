import './pages/RegistrationPage/registration.css';
import { RegistrationPage } from './pages/RegistrationPage/registration';
import { AuthService } from './services/authService';
import { Navigation } from './components/navigation';
import loginPage from './pages/loginPage/loginPage';
import { AuthorizationService } from './services/authentication';
import productAboutPage from './pages/productAboutPage/productAboutPage';
import { getProduct, handleProductAbout } from './services/getProduct';
import './pages/productAboutPage/productAboutPage.css';
import { customerApiRoot } from './services/customerApi';
import './assets/style.css';
import { ProfilePage } from './pages/ProfilePage/Profile';
import { CatalogPage } from './pages/catalogPage/catalog';
import { CartService } from './services/cartService';

let appContainer: HTMLElement;
export let navigation: Navigation;

document.addEventListener('DOMContentLoaded', async () => {
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

  setTimeout(async () => {
    try {
      await navigation.forceInitializeCart();
    } catch (error) {
      console.error('Ошибка доп инициализаціі корзіны:', error);
    }
  }, 200);
});

function setupRouting(): void {
  handleRouting();
  window.addEventListener('popstate', handleRouting);
}

function handleRouting(): void {
  const path = window.location.pathname;
  const isAuthenticated = AuthorizationService.isAuthenticated();
  appContainer.innerHTML = '';

  renderPageByPath(path, isAuthenticated);
  navigation.setActiveLink(path);
}

function renderPageByPath(path: string, isAuthenticated: boolean): void {
  switch (path) {
    case '/':
    case '/store':
      renderCatalogPage();
      break;
    case '/registration':
      renderRegistrationPage(isAuthenticated);
      break;
    case '/login':
      renderLoginPage(isAuthenticated);
      break;
    case '/product-about':
      renderProductAboutPage();
      break;
    case '/profile':
      renderProfilePage(isAuthenticated);
      break;
    case '/cart':
      renderCartPage();
      break;
    default:
      renderPlaceholderPage('Ошибка 404. Страница не найдена', isAuthenticated);
      break;
  }
}

function renderCatalogPage(): void {
  new CatalogPage(appContainer);
}

function renderRegistrationPage(isAuthenticated: boolean): void {
  if (!isAuthenticated) {
    new RegistrationPage(appContainer);
  } else {
    navigateTo('/store');
  }
}

function renderLoginPage(isAuthenticated: boolean): void {
  if (!isAuthenticated) {
    new loginPage(appContainer);
  } else {
    navigateTo('/store');
  }
}

function renderProductAboutPage(): void {
  void handleProductAbout(appContainer);
}

function renderProfilePage(isAuthenticated: boolean): void {
  if (isAuthenticated) {
    new ProfilePage(appContainer);
  } else {
    navigateTo('/login');
  }
}

export function navigateTo(path: string): void {
  window.history.pushState({}, '', path);
  handleRouting();
}

export async function handleUserAuthChange(): Promise<void> {
  try {
    const isAuthenticated = AuthorizationService.isAuthenticated();

    if (isAuthenticated) {
      await CartService.mergeAnonymousCartOnLogin();
    } else {
      CartService.clearCartCache();
    }

    await navigation.handleAuthChange();
  } catch (error) {
    console.error('Ошибка измененія аутентификации:', error);
    try {
      await navigation.handleAuthChange();
    } catch (navError) {
      console.error('Ошибка обновления навигации:', navError);
      navigation.render();
    }
  }
}

function renderCartPage(): void {
  const cartContainer = document.createElement('div');
  cartContainer.className = 'cart-page-container';

  const title = document.createElement('h1');
  title.textContent = 'Корзина';
  title.className = 'cart-page-title';

  const message = document.createElement('p');
  message.textContent = 'Страница корзины в разработке';
  message.className = 'cart-page-message';

  cartContainer.appendChild(title);
  cartContainer.appendChild(message);
  appContainer.appendChild(cartContainer);
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

  const logoutButton = document.createElement('button');
  logoutButton.className = 'logout-button';
  logoutButton.textContent = 'Выйти из учетной записи';
  logoutButton.addEventListener('click', async () => {
    AuthorizationService.logout();
    await handleUserAuthChange();
    navigateTo('/login');
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
  } else {
    createUnauthenticatedContent(container);
  }

  appContainer.appendChild(container);
}
