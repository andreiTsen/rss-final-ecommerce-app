import { navigateTo } from '../main';
import { AuthService } from '../services/authService';

type Page = {
  name: string;
  path: string;
};

export class Navigation {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.render();
  }

  public setActiveLink(targetPath: string): void {
    const links = this.root.querySelectorAll('.nav-link');
    links.forEach((link) => {
      if (link.getAttribute('href') === targetPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  public render(): void {
    this.root.innerHTML = '';

    const nav = document.createElement('nav');
    nav.classList.add('navbar');

    const homeLink = this.createLink('Главная', '/');
    nav.appendChild(homeLink);

    if (AuthService.isAuthenticated()) {
      const profileLink = this.createLink('👤 Профиль', '/profile');
      const logoutButton = this.createLogoutButton();

      nav.appendChild(profileLink);
      nav.appendChild(logoutButton);
    } else {
      const loginLink = this.createLink('Вход', '/login');
      const registerLink = this.createLink('Регистрация', '/registration');

      nav.appendChild(loginLink);
      nav.appendChild(registerLink);
    }

    this.root.appendChild(nav);
  }

  private createLink(name: string, path: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = path;
    link.textContent = name;
    link.classList.add('nav-link');

    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigateTo(path);
    });
    return link;
  }

  private createLogoutButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = 'Выйти';
    button.classList.add('nav-btn');
    button.addEventListener('click', () => {
      AuthService.logout();
      this.render();
      navigateTo('/');
    });
    return button;
  }
}
