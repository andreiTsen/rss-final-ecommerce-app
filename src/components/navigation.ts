import { navigateTo } from '../main';
import '../components/navigation.css';
import { AuthorizationService } from '../services/authentication';
import { CartService, CartData } from '../services/cartService';

export class Navigation {
  private root: HTMLElement;
  private isInitialized: boolean = false;
  private cartUpdateCallback: ((cart: CartData) => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.render();
    this.setupCartSubscription();
    void this.initializeCartCounter();
  }

  public resubscribeToCart(): void {
    CartService.resetCallbacks();

    this.cartUpdateCallback = (cart: CartData): void => {
      this.updateCartCounterWithData(cart);
    };

    CartService.onCartUpdate(this.cartUpdateCallback);

    setTimeout((): void => {
      void this.updateCartCounter();
    }, 100);
  }

  public async updateCartCounter(): Promise<void> {
    try {
      const cart = await CartService.getOrCreateCart();
      this.updateCartCounterWithData(cart);
    } catch (error) {
      console.error('Ошибка обновленія счетчика', error);
      const cartLink = document.getElementById('cart-link');
      if (cartLink) {
        cartLink.textContent = '🛒 Корзина';
      }
    }
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

    const nav = document.createElement('nav');
    nav.classList.add('navbar');

    const homeLink = this.createLink('Каталог', '/store');
    const cartLink = this.createLink('🛒 Корзина', '/cart', 'cart-link');

    nav.appendChild(homeLink);
    nav.appendChild(cartLink);

    if (AuthorizationService.isAuthenticated()) {
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

    setTimeout((): void => {
      if (this.isInitialized) {
        void this.updateCartCounter();
      } else {
        void this.initializeCartCounter();
      }
    }, 50);
  }

  public forceUpdate(): void {
    this.render();
    setTimeout((): void => {
      this.resubscribeToCart();
    }, 100);
  }

  public async forceInitializeCart(): Promise<void> {
    await this.initializeCartCounter();
  }

  public async handleAuthChange(): Promise<void> {
    this.render();

    setTimeout((): void => {
      this.resubscribeToCart();
    }, 100);
  }

  private setupCartSubscription(): void {
    this.cartUpdateCallback = (cart: CartData): void => {
      this.updateCartCounterWithData(cart);
    };

    CartService.onCartUpdate(this.cartUpdateCallback);
  }

  private async initializeCartCounter(): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const cart = await CartService.getOrCreateCart();

      this.updateCartCounterWithData(cart);
      this.isInitialized = true;
    } catch (error) {
      console.error('Ошибка иніциализации счетчика', error);
      this.isInitialized = true;
    }
  }

  private updateCartCounterWithData(cart: CartData): void {
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
      const itemCount = cart.itemCount || 0;
      cartLink.textContent = itemCount > 0 ? `🛒 Корзина (${itemCount})` : '🛒 Корзина';
    } else {
      console.warn('Элемент cart-link не найден в DOM');
    }
  }

  private createLogoutButton(): HTMLButtonElement {
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Выйти';
    logoutButton.className = 'nav-link logout-btn';

    logoutButton.addEventListener('click', async (): Promise<void> => {
      AuthorizationService.logout();

      const { handleUserAuthChange } = await import('../main');
      await handleUserAuthChange();

      const { navigateTo } = await import('../main');
      navigateTo('/store');
    });

    return logoutButton;
  }

  private createLink(name: string, path: string, id?: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = path;
    link.textContent = name;
    link.classList.add('nav-link');

    if (id) {
      link.id = id;
    }

    link.addEventListener('click', (event): void => {
      event.preventDefault();
      navigateTo(path);
    });
    return link;
  }
}
