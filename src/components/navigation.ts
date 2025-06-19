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
    this.root.classList.add('navbar');
    const homeLink = this.createLink('Каталог', '/store');
    const loginLink = this.createLink('Вход', '/login');
    const registerLink = this.createLink('Регистрация', '/registration');
    const aboutLink = this.createLink('О разработчиках', '/about-us');
    this.root.appendChild(homeLink);
    this.root.appendChild(loginLink);
    this.root.appendChild(registerLink);
    this.root.appendChild(aboutLink);
    const cartLink = this.createLink('🛒 Корзина', '/cart', 'cart-link');
    this.root.appendChild(cartLink);
    if (AuthorizationService.isAuthenticated()) {
      const profileLink = this.createLink('👤 Профиль', '/profile');
      this.root.appendChild(profileLink);
    }
    // } else {
    //   const loginLink = this.createLink('Вход', '/login');
    //   const registerLink = this.createLink('Регистрация', '/registration');
    //   this.root.appendChild(loginLink);
    //   this.root.appendChild(registerLink);
    // }
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
