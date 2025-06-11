export class ShoppingCartPage {
  constructor() {
    this.render();
  }
  private render(): void {
    const container = document.createElement('div');
    container.className = 'shopping-cart-container';

    const title = document.createElement('h1');
    title.textContent = 'Корзина покупок';
    container.appendChild(title);

    document.body.appendChild(container);
  }
}
