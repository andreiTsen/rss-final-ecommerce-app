import { CartService } from '../../services/cartService';
import './carts.css';
type CartItem = {
  id: string; // Был number, теперь string — как в CartService!
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string; // Добавлено поле для картинки
};

export class ShoppingCartPage {
  public element?: HTMLElement;
  public cartItems: CartItem[] = [];
  public loading: boolean = true;
  public error: string | null = null;

  constructor() {
    void this.fetchCartItems();
  }

  public get totalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  public async fetchCartItems(): Promise<void> {
    try {
      // Получаем корзину через CartService
      const cart = await CartService.getOrCreateCart();
      console.log('Fetched cart:', cart);
      // Преобразуем данные в формат CartItem, если надо
      this.cartItems = cart.lineItems.map(item => ({
        id: item.id, // тут был number, а в сервисе string, поменяй тип в CartItem на string!
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl // предполагается, что в item есть поле imageUrl
      }));
      console.log('Cart items:', this.cartItems);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      this.loading = false;
      this.render();
    }
  }
  public render(): void {
    const main = document.getElementById('app');
    if (!main) return;

    main.innerHTML = '';
    const container = document.createElement('div');
    container.classList.add('container');

    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = 'Shopping Cart';
    container.appendChild(title);

    if (this.loading) {
      container.appendChild(this.createLoadingElement());
    } else if (this.error) {
      container.appendChild(this.createErrorElement());
    } else if (this.cartItems.length === 0) {
      container.appendChild(this.createEmptyElement());
    } else {
      container.appendChild(this.createCartItemsList());
      container.appendChild(this.createTotalPriceElement());
    }

    main.appendChild(container);
    console.log('Rendering cart items...');
  }
  private createLoadingElement(): HTMLElement {
    const loadingElement = document.createElement('p');
    loadingElement.textContent = 'Loading...';
    return loadingElement;
  }

  private createErrorElement(): HTMLElement {
    const errorElement = document.createElement('p');
    errorElement.textContent = `Error: ${this.error}`;
    errorElement.style.color = 'red';
    return errorElement;
  }

  private createEmptyElement(): HTMLElement {
    const emptyElement = document.createElement('p');
    emptyElement.textContent = 'Your cart is empty.';
    return emptyElement;
  }

  private createCartItemElement(item: CartItem): HTMLElement {
    const itemCard = document.createElement('div');
    itemCard.classList.add('cart-item-card');

    if (item.imageUrl) {
      const imageElement = document.createElement('img');
      imageElement.src = item.imageUrl;
      imageElement.alt = item.name;
      imageElement.classList.add('cart-item-image');
      itemCard.appendChild(imageElement);
    }

    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    itemCard.appendChild(nameElement);

    const quantityElement = document.createElement('p');
    quantityElement.classList.add('cart-item-quantity');
    quantityElement.textContent = `Количество: ${item.quantity}`;
    itemCard.appendChild(quantityElement);

    const priceElement = document.createElement('p');
    priceElement.classList.add('cart-item-price');
    priceElement.textContent = `Цена: ${item.price.toFixed(2)}`;
    itemCard.appendChild(priceElement);

    const totalElement = document.createElement('p');
    totalElement.classList.add('cart-item-total');
    totalElement.textContent = `Стоимость: ${(item.price * item.quantity).toFixed(2)}`;
    itemCard.appendChild(totalElement);

    return itemCard;
  }

  private createCartItemsList(): HTMLElement {
    const list = document.createElement('div');
    list.classList.add('cart-items');
    this.cartItems.forEach(item => {
      const itemCard = this.createCartItemElement(item);
      list.appendChild(itemCard);
    });
    return list;
  }

  private createTotalPriceElement(): HTMLElement {
    const totalPriceElement = document.createElement('h3');
    totalPriceElement.textContent = `Total Price: ${this.totalPrice.toFixed(2)}`;
    return totalPriceElement;
  }


}

new ShoppingCartPage();