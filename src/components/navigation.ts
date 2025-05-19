import { navigateTo } from '../main';
import { AuthService } from '../services/authService';
import '../components/navigation.css';

export class Navigation {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.render();
  }

  public setActiveLink(targetPath: string): void {
    const links = this.root.querySelectorAll('.nav-link');
    links.forEach((link) => {
      const linkPath = link.getAttribute('href');
      if (
        linkPath === targetPath ||
        (linkPath === '/' && targetPath === '/store') ||
        (targetPath === '/stre' && linkPath === '/')
      ) {
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
    const loginLink = this.createLink('Вход', '/login');
    const registerLink = this.createLink('Регистрация', '/registration');

    nav.appendChild(homeLink);
    nav.appendChild(loginLink);
    nav.appendChild(registerLink);

    if (AuthService.isAuthenticated()) {
      const profileLink = this.createLink('👤 Профиль', '/profile');
      nav.appendChild(profileLink);
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
}
