import { navigateTo } from '../main';
import '../components/navigation.css';
import { AuthorizationService } from '../services/authentication';

export class Navigation {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.render();
  }

  public static createBurgerMenu(): HTMLElement {
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('hamburger__icon');
    const line1 = document.createElement('span');
    line1.classList.add('hamburger__icon--item', 'line1');
    const line2 = document.createElement('span');
    line2.classList.add('hamburger__icon--item', 'line2');
    iconContainer.append(line1, line2);
    return iconContainer;
  }

  public setActiveLink(targetPath: string): void {
    const links = this.root.querySelectorAll('.nav-link');
    links.forEach((link) => {
      const linkPath = link.getAttribute('href');
      if (
        linkPath === targetPath ||
        (linkPath === '/' && targetPath === '/store') ||
        (targetPath === '/store' && linkPath === '/')
      ) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  public render(): void {
    this.root.innerHTML = '';
    this.root.classList.add('navbar');

    const homeLink = this.createLink('Каталог', '/store');
    const loginLink = this.createLink('Вход', '/login');
    const registerLink = this.createLink('Регистрация', '/registration');
    const aboutLink = this.createLink('О разработчиках', '/about-us');

    this.root.appendChild(homeLink);
    this.root.appendChild(loginLink);
    this.root.appendChild(registerLink);
    this.root.appendChild(aboutLink);

    if (AuthorizationService.isAuthenticated()) {
      const profileLink = this.createLink('👤 Профиль', '/profile');
      this.root.appendChild(profileLink);
    }
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
