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
import { CartService } from './services/cart';
import AboutPage from './pages/aboutPage/aboutPage';
// const appRoot = document.body;

let appContainer: HTMLElement;
export let navigation: Navigation;

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

// function handleRouting(): void {
//   const path = window.location.pathname;
//   const isAuthenticated = AuthorizationService.isAuthenticated();
//   appContainer.innerHTML = '';
//   switch (path) {
//     case '/':
//     case '/store':
//       new CatalogPage(appContainer);
//       break;
//     case '/registration':
//       if (!isAuthenticated) {
//         new RegistrationPage(appContainer);
//       } else {
//         navigateTo('/store');
//       }
//       break;
//     case '/login':
//       if (!isAuthenticated) {
//         new loginPage(appContainer);
//       } else {
//         navigateTo('/store');
//       }
//       break;
//     case '/product-about': {
//       void handleProductAbout(appContainer);
//       break;
//     }
//     case '/profile':
//       if (isAuthenticated) {
//         new ProfilePage(appContainer);
//       } else {
//         navigateTo('/login');
//       }
//       break;
//     case '/about-us': {
//       new AboutPage(appContainer);
//       break;
//     }
//     default:
//       renderPlaceholderPage('Oшибка 404. Страница не найдена', isAuthenticated);
//       break;
//   }
//   navigation.setActiveLink(path);
// }

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
  logoutButton.addEventListener('click', () => {
    AuthorizationService.logout();
    navigation.render();
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
