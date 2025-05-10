import './pages/registration.css';
import { RegistrationPage } from './pages/registration';
import { AuthService } from './services/authService';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app') || document.body;
  const path = window.location.pathname;

  const isAuthenticated = AuthService.isAuthenticated();

  switch (path) {
    case '/registration':
    case '/register':
      if (!isAuthenticated) {
        new RegistrationPage(appContainer);
      } else {
        window.history.pushState({ page: 'store' }, 'Store page', '/store');
        renderPlaceholderPage(appContainer, 'Страница магазина', isAuthenticated);
      }
      break;
    case '/login':
      if (!isAuthenticated) {
        renderPlaceholderPage(appContainer, 'Страница входа', isAuthenticated);
      } else {
        window.history.pushState({ page: 'store' }, 'Store page', '/store');
        renderPlaceholderPage(appContainer, 'Страница магазина', isAuthenticated);
      }
      break;
    case '/store':
    case '/':
      renderPlaceholderPage(appContainer, 'Страница магазина', isAuthenticated);
      break;
    default:
      renderPlaceholderPage(appContainer, 'Страница не найдена', isAuthenticated);
      break;
  }
});

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

function createAuthenticatedContent(pageContainer: HTMLDivElement, pageName: string): void {
  if (pageName !== 'Страница магазина') return;

  const user = AuthService.getCurrentUser();

  const welcomeMessage = document.createElement('p');
  welcomeMessage.className = 'welcome-message';
  welcomeMessage.textContent = `Добро пожаловать, ${user?.firstName || 'пользователь'}! Вы вошли в систему.`;
  pageContainer.appendChild(welcomeMessage);

  const logoutButton = document.createElement('button');
  logoutButton.className = 'logout-button';
  logoutButton.textContent = 'Выйти из учетной записи';
  logoutButton.addEventListener('click', () => {
    AuthService.logout();
    window.location.reload();
  });
  pageContainer.appendChild(logoutButton);
}

function createUnauthenticatedContent(pageContainer: HTMLDivElement): void {
  const authLinks = document.createElement('div');
  authLinks.className = 'auth-links';

  const registerLink = document.createElement('a');
  registerLink.href = '/registration';
  registerLink.textContent = 'Регистрация';
  registerLink.className = 'auth-link';

  const separator = document.createTextNode(' | ');

  const loginLink = document.createElement('a');
  loginLink.href = '/login';
  loginLink.textContent = 'Вход';
  loginLink.className = 'auth-link';

  authLinks.appendChild(registerLink);
  authLinks.appendChild(separator);
  authLinks.appendChild(loginLink);

  pageContainer.appendChild(authLinks);
}

function renderPlaceholderPage(container: HTMLElement, pageName: string, isAuthenticated: boolean): void {
  container.textContent = '';

  const pageContainer = createPlaceholderContainer(pageName);

  if (isAuthenticated) {
    createAuthenticatedContent(pageContainer, pageName);
  } else {
    createUnauthenticatedContent(pageContainer);
  }

  container.appendChild(pageContainer);
}
