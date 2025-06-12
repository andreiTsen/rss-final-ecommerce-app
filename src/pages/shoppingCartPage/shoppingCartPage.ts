import { CartService } from '../../services/cartService';
import './carts.css';
type CartItem = {
  id: string; 
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string; 
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
      const cart = await CartService.getOrCreateCart();
      console.log('Fetched cart:', cart);
      this.cartItems = cart.lineItems.map((item) => ({
        id: item.id, 
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
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
    const container = this.createContainer();

    main.appendChild(container);
    console.log('Rendering cart items...');
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('container');

    container.appendChild(this.createTitleElement());

    if (this.loading) {
      container.appendChild(this.createLoadingElement());
    } else if (this.error) {
      container.appendChild(this.createErrorElement());
    } else if (this.cartItems.length === 0) {
      container.appendChild(this.createEmptyElement());
    } else {
      container.appendChild(this.createCartItemsList());
      container.appendChild(this.createTotalPriceElement());
      container.appendChild(this.createPromoSection());
      container.appendChild(this.createClearCartButton());
    }

    return container;
  }

  private createTitleElement(): HTMLElement {
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = 'Shopping Cart';
    return title;
  }

  private createPromoSection(): HTMLElement {
    const promoContainer = document.createElement('div');
    promoContainer.classList.add('promo-container');

    const promoInput = document.createElement('input');
    promoInput.type = 'text';
    promoInput.placeholder = '#Введите промокод';
    promoInput.classList.add('promo-input');
    promoContainer.appendChild(promoInput);

    const promoButton = document.createElement('button');
    promoButton.textContent = 'Зарегистрировать';
    promoButton.classList.add('promo-button');
    promoButton.addEventListener('click', () => {
      const promoCode = promoInput.value.trim();
      if (promoCode) {
        alert(`Промокод "${promoCode}" зарегистрирован!`);
        promoInput.value = '';
      }
    });
    promoContainer.appendChild(promoButton);

    return promoContainer;
  }

  private createClearCartButton(): HTMLElement {
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Очистить корзину';
    clearButton.classList.add('clear-cart-button');
    clearButton.addEventListener('click', async () => {
      await CartService.clearCart();
      await this.fetchCartItems();
      this.render();
    });
    return clearButton;
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
    emptyElement.textContent = 'Корзина пуста.';
    return emptyElement;
  }

  private createCartItemElement(item: CartItem): HTMLElement {
    const itemCard = document.createElement('div');
    itemCard.classList.add('cart-item-card');

    const imageElement = this.createCartItemImageElement(item);
    if (imageElement) {
      itemCard.appendChild(imageElement);
    }

    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    itemCard.appendChild(nameElement);

    const labelElement = document.createElement('label');
    labelElement.textContent = 'Количество:';
    labelElement.classList.add('cart-item-label');
    itemCard.appendChild(labelElement);

    const quantityElement = this.createCartItemQuantityInput(item, labelElement);
    labelElement.appendChild(quantityElement);

    const priceElement = document.createElement('p');
    priceElement.classList.add('cart-item-price');
    priceElement.textContent = `Цена: ${item.price.toFixed(2)}$`;
    itemCard.appendChild(priceElement);

    const totalElement = document.createElement('p');
    totalElement.classList.add('cart-item-total');
    totalElement.textContent = `Стоимость: ${(item.price * item.quantity).toFixed(2)}$`;
    itemCard.appendChild(totalElement);

    const deleteButton = this.createCartItemDeleteButton(item);
    itemCard.appendChild(deleteButton);

    return itemCard;
  }

  private createCartItemImageElement(item: CartItem): HTMLImageElement | null {
    if (!item.imageUrl) return null;
    const imageElement = document.createElement('img');
    imageElement.src = item.imageUrl;
    imageElement.alt = item.name;
    imageElement.classList.add('cart-item-image');
    return imageElement;
  }

  private createCartItemQuantityInput(item: CartItem, labelElement: HTMLElement): HTMLInputElement {
    const quantityElement = document.createElement('input');
    quantityElement.type = 'number';
    quantityElement.min = '1';
    quantityElement.value = item.quantity.toString();
    quantityElement.classList.add('cart-item-quantity');
    quantityElement.addEventListener('change', async (event) => {
      const target = event.target;
      if (target && target instanceof HTMLInputElement) {
        const newQuantity = parseInt(target.value, 10);
        if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity !== item.quantity) {
          await CartService.updateProductQuantity(item.id, newQuantity);
          await this.fetchCartItems();
          this.render();
        } else {
          target.value = item.quantity.toString();
        }
      }
    });
    return quantityElement;
  }

  private createCartItemDeleteButton(item: CartItem): HTMLButtonElement {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.classList.add('cart-item-delete-button');
    deleteButton.addEventListener('click', async () => {
      await CartService.removeProductFromCart(item.id);
      await this.fetchCartItems();
      this.render();
    });
    return deleteButton;
  }

  private createCartItemsList(): HTMLElement {
    const list = document.createElement('div');
    list.classList.add('cart-items');
    this.cartItems.forEach((item) => {
      const itemCard = this.createCartItemElement(item);
      list.appendChild(itemCard);
    });
    return list;
  }

  private createTotalPriceElement(): HTMLElement {
    const totalPriceElement = document.createElement('h3');
    totalPriceElement.textContent = `Общая стоимость: ${this.totalPrice.toFixed(2)}$`;
    totalPriceElement.classList.add('total-price');
    return totalPriceElement;
  }
}

new ShoppingCartPage();