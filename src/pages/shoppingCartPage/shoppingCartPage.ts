import { CartService } from '../../services/cartService';
import { apiRoot } from '../../api';
import { renderModal } from '../ProfilePage/modal';

import './carts.css';
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type PromoCode = {
  code: string;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  discountPercentage: number;
};

export class ShoppingCartPage {
  public element?: HTMLElement;
  public cartItems: CartItem[] = [];
  public loading: boolean = true;
  public error: string | null = null;
  private activePromoCode: PromoCode | null = null;

  constructor() {
    void this.fetchCartItems();
  }

  public get totalPrice(): number {
    let total = this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    if (this.activePromoCode && this.activePromoCode.isActive) {
      total = total * (1 - this.activePromoCode.discountPercentage / 100);
    }
    return total;
  }

  public async fetchCartItems(): Promise<void> {
    try {
      const cart = await CartService.getOrCreateCart();
      this.cartItems = cart.lineItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));

      const response = await apiRoot.discountCodes().get().execute();
      const activePromo = response.body.results.find((code) => code.isActive);
      if (activePromo) {
        this.activePromoCode = {
          code: activePromo.code,
          isActive: activePromo.isActive,
          validFrom: activePromo.validFrom,
          validUntil: activePromo.validUntil,
          discountPercentage: activePromo.custom?.fields?.discountPercentage ?? 70,
        };
      }
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
      container.appendChild(this.createReturnToCatalogButton());
    } else {
      container.appendChild(this.createCartItemsList());
      container.appendChild(this.createTotalPriceElement());
      container.appendChild(this.createPromoSection());
      if (this.activePromoCode) {
        container.appendChild(this.createActivePromoCodeElement());
      }
      container.appendChild(this.createClearCartButton());
    }

    return container;
  }

  private createReturnToCatalogButton(): HTMLElement {
    const returnButton = document.createElement('button');
    returnButton.textContent = 'Вернуться в каталог';
    returnButton.classList.add('return-to-catalog-button');
    returnButton.addEventListener('click', () => {
      window.history.pushState({}, '', '/store');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    return returnButton;
  }

  private createTitleElement(): HTMLElement {
    const title = document.createElement('h2');
    title.classList.add('title');
    title.textContent = 'Shopping Cart';
    return title;
  }

  private async checkPromoCode(promoCode: string): Promise<PromoCode | null> {
    try {
      const response = await apiRoot.discountCodes().get().execute();
      const foundPromo = response.body.results.find((code) => code.code === promoCode);
      if (!foundPromo) return null;

      const promo: PromoCode = {
        code: foundPromo.code,
        isActive: foundPromo.isActive,
        validFrom: foundPromo.validFrom,
        validUntil: foundPromo.validUntil,
        discountPercentage: foundPromo.custom?.fields?.discountPercentage ?? 70,
      };
      return promo;
    } catch (error) {
      console.error('Error checking promo code:', error);
      return null;
    }
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
    promoButton.addEventListener('click', async () => {
      await this.handlePromoButtonClick(promoInput.value.trim());
    });
    promoContainer.appendChild(promoButton);

    return promoContainer;
  }

  private async handlePromoButtonClick(promoCode: string): Promise<void> {
    const promoResult = await this.checkPromoCode(promoCode);
    if (!promoResult) {
      this.showPromoNotFoundModal(promoCode);
      return;
    }
    if (!promoResult.isActive) {
      const activated = await this.activatePromoCode(promoResult);
      if (!activated) return;
    }
    if (!this.isPromoValid(promoResult)) {
      this.showPromoInvalidModal(promoCode);
      return;
    }
    this.applyPromoCode(promoResult, promoCode);
  }

  private showPromoNotFoundModal(promoCode: string): void {
    document.body.appendChild(renderModal(`Промокод #${promoCode} не найден!`));
  }

  private async activatePromoCode(promoResult: PromoCode): Promise<boolean> {
    const response = await apiRoot
      .discountCodes()
      .get({ queryArgs: { where: `code="${promoResult.code}"` } })
      .execute();
    const discount = response.body.results[0];
    if (!discount) {

      return false;
    }
    await apiRoot
      .discountCodes()
      .withId({ ID: discount.id })
      .post({
        body: {
          version: discount.version,
          actions: [
            {
              action: 'changeIsActive',
              isActive: true,
            },
          ],
        },
      })
      .execute();
    promoResult.isActive = true;
    this.activePromoCode = promoResult;
    this.render();
    return true;
  }

  private isPromoValid(promoResult: PromoCode): boolean {
    const now = new Date();
    const validFrom = promoResult.validFrom ? new Date(promoResult.validFrom) : null;
    const validUntil = promoResult.validUntil ? new Date(promoResult.validUntil) : null;
    return !((validFrom && now < validFrom) || (validUntil && now > validUntil));
  }

  private showPromoInvalidModal(promoCode: string): void {
    document.body.appendChild(renderModal(`Промокод #${promoCode} не валиден!`));
  }

  private applyPromoCode(promoResult: PromoCode, promoCode: string): void {
    this.activePromoCode = promoResult;
    document.body.appendChild(
      renderModal(`Промокод #${promoCode} успешно применен! Скидка: ${promoResult.discountPercentage}%`)
    );
    this.render();
  }

  private createActivePromoCodeElement(): HTMLElement {
    const activePromoElement = document.createElement('div');
    activePromoElement.classList.add('active-promo-code');
    if (this.activePromoCode) {
      activePromoElement.appendChild(this.createPromoTextElement());
      const removeButton = this.createRemovePromoButton(activePromoElement);
      activePromoElement.appendChild(removeButton);
    }
    return activePromoElement;
  }

  private createPromoTextElement(): HTMLElement {
    const promoText = document.createElement('span');
    if (this.activePromoCode) {
      promoText.textContent = `Активный промокод: ${this.activePromoCode.code} (Скидка: ${this.activePromoCode.discountPercentage}%)`;
    }
    return promoText;
  }

  private createRemovePromoButton(activePromoElement: HTMLElement): HTMLElement {
    const removeButton = document.createElement('span');
    removeButton.textContent = '✕';
    removeButton.classList.add('remove-promo');
    removeButton.style.cursor = 'pointer';
    removeButton.style.marginLeft = '10px';
    removeButton.style.display = 'none';
    activePromoElement.addEventListener('mouseenter', () => {
      removeButton.style.display = 'inline';
    });
    activePromoElement.addEventListener('mouseleave', () => {
      removeButton.style.display = 'none';
    });
    removeButton.addEventListener('click', async () => {
      await this.handleRemovePromoClick();
    });

    return removeButton;
  }

  private async handleRemovePromoClick(): Promise<void> {
    if (this.activePromoCode) {
      const response = await apiRoot
        .discountCodes()
        .get({ queryArgs: { where: `code="${this.activePromoCode.code}"` } })
        .execute();
      const discount = response.body.results[0];
      if (!discount) {
        alert('Промокод не найден!');
        return;
      }
      await apiRoot
        .discountCodes()
        .withId({ ID: discount.id })
        .post({
          body: {
            version: discount.version,
            actions: [
              {
                action: 'changeIsActive',
                isActive: false,
              },
            ],
          },
        })
        .execute();
      this.activePromoCode = null;
      this.render();
    }
  }

  private createClearCartButton(): HTMLElement {
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Очистить корзину';
    clearButton.classList.add('clear-cart-button');
    clearButton.addEventListener('click', async () => {
      await CartService.clearCart();
      this.activePromoCode = null;
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

    const quantityElement = this.createCartItemQuantityInput(item);
    labelElement.appendChild(quantityElement);

    const priceElement = this.createCartItemPriceElement(item);
    itemCard.appendChild(priceElement);

    const totalElement = this.createCartItemTotalElement(item);
    itemCard.appendChild(totalElement);

    const deleteButton = this.createCartItemDeleteButton(item);
    itemCard.appendChild(deleteButton);

    return itemCard;
  }

  private createCartItemPriceElement(item: CartItem): HTMLElement {
    const priceElement = document.createElement('p');
    priceElement.classList.add('cart-item-price');
    priceElement.textContent = `Цена: ${item.price.toFixed(2)}₽`;
    return priceElement;
  }

  private createCartItemTotalElement(item: CartItem): HTMLElement {
    const totalElement = document.createElement('p');
    totalElement.classList.add('cart-item-total');
    const itemTotal = item.price * item.quantity;
    if (this.activePromoCode && this.activePromoCode.isActive) {
      const discountedTotal = itemTotal * (1 - this.activePromoCode.discountPercentage / 100);
      const oldPriceSpan = document.createElement('span');
      oldPriceSpan.textContent = `(${itemTotal.toFixed(2)}$)`;
      totalElement.textContent = `Стоимость: ${discountedTotal.toFixed(2)}$ `;
      totalElement.appendChild(oldPriceSpan);
    } else {
      totalElement.textContent = `Стоимость: ${itemTotal.toFixed(2)}$`;
    }
    return totalElement;
  }

  private createCartItemImageElement(item: CartItem): HTMLImageElement | null {
    if (!item.imageUrl) return null;
    const imageElement = document.createElement('img');
    imageElement.src = item.imageUrl;
    imageElement.alt = item.name;
    imageElement.classList.add('cart-item-image');
    return imageElement;
  }

  private createCartItemQuantityInput(item: CartItem): HTMLInputElement {
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
    const originalPrice = this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    if (this.activePromoCode && this.activePromoCode.isActive) {
      const oldPriceSpan = document.createElement('span');
      oldPriceSpan.textContent = `(${originalPrice.toFixed(2)}$)`;
      totalPriceElement.textContent = `Общая стоимость: ${this.totalPrice.toFixed(2)}$ `;
      totalPriceElement.appendChild(oldPriceSpan);
    } else {
      totalPriceElement.textContent = `Общая стоимость: ${originalPrice.toFixed(2)}$`;
    }
    totalPriceElement.classList.add('total-price');
    return totalPriceElement;
  }
}

new ShoppingCartPage();
