import './pages/RegistrationPage/registration.css';
import { RegistrationPage } from './pages/RegistrationPage/registration';
import { Navigation } from './components/navigation';
import loginPage from './pages/loginPage/loginPage';
import { AuthorizationService } from './services/authentication';
import productAboutPage from './pages/productAboutPage/productAboutPage';
import { getProduct, handleProductAbout } from './services/getProduct';
import './pages/productAboutPage/productAboutPage.css';
import './assets/style.css';
import { ProfilePage } from './pages/ProfilePage/Profile';
import { CatalogPage } from './pages/catalogPage/catalog';
import AboutPage from './pages/aboutPage/aboutPage';
import hamburgerMenu from './components/hamburgerMenu.';
import { ShoppingCartPage } from './pages/shoppingCartPage/shoppingCartPage';
import { CartService } from './services/cartService';

let appContainer: HTMLElement;
export let navigation: Navigation;

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const wrapper = document.createElement('div');
  wrapper.className = 'body-wrapper';
  body.appendChild(wrapper);

  const header = document.createElement('header');
  header.classList.add('header');
  wrapper.appendChild(header);

  const title = document.createElement('span');
  title.classList.add('nav-title');
  title.textContent = 'Crazy Bookstore';
  header.appendChild(title);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  header.appendChild(nav);
  navigation = new Navigation(nav);
  header.appendChild(Navigation.createBurgerMenu());
  const existingContainer = document.getElementById('app');

  if (existingContainer instanceof HTMLElement) {
    appContainer = existingContainer;
  } else {
    appContainer = document.createElement('main');
    appContainer.id = 'app';
    wrapper.appendChild(appContainer);
  }
  hamburgerMenu();
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

  const routes = {
    '/': (): CatalogPage => new CatalogPage(appContainer),
    '/store': (): CatalogPage => new CatalogPage(appContainer),
    '/registration': (): void | RegistrationPage =>
      !isAuthenticated ? new RegistrationPage(appContainer) : navigateTo('/store'),
    '/login': (): void | loginPage => (!isAuthenticated ? new loginPage(appContainer) : navigateTo('/store')),
    '/product-about': (): void => void handleProductAbout(appContainer),
    '/profile': (): ProfilePage | void => (isAuthenticated ? new ProfilePage(appContainer) : navigateTo('/login')),
    '/about-us': (): AboutPage => new AboutPage(appContainer),
    '/cart': (): ShoppingCartPage => new ShoppingCartPage(),
    default: (): void => renderPlaceholderPage('Oшибка 404. Страница не найдена', isAuthenticated),
  } as const;

  type RouteKey = keyof typeof routes;

  function isRouteKey(path: string): path is RouteKey {
    return path in routes;
  }

  const handler = isRouteKey(path) ? routes[path] : routes.default;
  handler();
  navigation.setActiveLink(path);
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
    console.error('Ошибка изменения аутентификации:', error);
    try {
      await navigation.handleAuthChange();
    } catch (navError) {
      console.error('Ошибка обновления навигации:', navError);
      navigation.render();
    }
  }
}

function renderCartPage(): void {
  new ShoppingCartPage();
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
