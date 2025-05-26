import './catalog.css';

export class CatalogPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    const catalogContainer = document.createElement('div');
    catalogContainer.className = 'catalog-container';

    const catalogHeader = this.createCatalogHeader();
    catalogContainer.appendChild(catalogHeader);

    const catalogContent = document.createElement('div');
    catalogContent.className = 'catalog-content';

    const sidebar = this.createSidebar();
    const mainContent = this.createMainContent();

    catalogContent.appendChild(sidebar);
    catalogContent.appendChild(mainContent);

    catalogContainer.appendChild(catalogContent);
    this.container.appendChild(catalogContainer);
  }

  private createSidebar(): HTMLElement {
    const sidebar = document.createElement('aside');
    sidebar.className = 'catalog-sidebar';

    const categoriesSection = this.createCategoriesSection();
    sidebar.appendChild(categoriesSection);

    return sidebar;
  }

  private createCategoriesSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'categories-section';

    const title = document.createElement('h3');
    title.className = 'sidebar-title';
    title.textContent = 'Категории';

    const categoriesList = document.createElement('ul');
    categoriesList.className = 'categories-list';

    const categories = ['Художественная литература', 'Научная литература', 'Детские книги', 'Учебники', 'Комиксы'];

    categories.forEach((categoryName) => {
      const listItem = document.createElement('li');
      listItem.className = 'category-item';

      const link = document.createElement('a');
      link.href = '#';
      link.className = 'category-link';
      link.textContent = categoryName;

      listItem.appendChild(link);
      categoriesList.appendChild(listItem);
    });

    section.appendChild(title);
    section.appendChild(categoriesList);

    return section;
  }

  private createCatalogHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'catalog-header';

    const title = document.createElement('h1');
    title.className = 'catalog-title';
    title.textContent = 'Каталог товаров';

    header.appendChild(title);
    return header;
  }

  private createMainContent(): HTMLElement {
    const mainContent = document.createElement('main');
    mainContent.className = 'catalog-main';

    const productsGrid = this.createProductsGrid();
    mainContent.appendChild(productsGrid);

    return mainContent;
  }

  private createProductsGrid(): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'products-grid';

    for (let i = 1; i <= 12; i++) {
      const productKey = `atomic-habits`;
      const productCard = this.createProductCard(i, productKey);
      grid.appendChild(productCard);
    }

    return grid;
  }

  private createProductCard(index: number, key: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = this.createImageContainer(index);
    const productInfo = this.createProductInfo(index, key);

    card.appendChild(imageContainer);
    card.appendChild(productInfo);

    return card;
  }

  private createImageContainer(index: number): HTMLElement {
    const hasDiscount = index % 3 === 0;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';

    const image = document.createElement('img');
    image.src = `https://test${index}`;
    image.alt = `Книга ${index}`;
    image.className = 'product-image';

    imageContainer.appendChild(image);

    if (hasDiscount) {
      const discountBadge = document.createElement('span');
      discountBadge.className = 'discount-badge';
      discountBadge.textContent = '-20%';
      imageContainer.appendChild(discountBadge);
    }

    return imageContainer;
  }

  private createProductInfo(index: number, key: string): HTMLElement {
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';

    const title = this.createProductTitle(index);
    const author = this.createProductAuthor(index);
    const priceContainer = this.createPriceContainer(index);
    const addToCartButton = this.createAddToCartButton(key);

    productInfo.appendChild(title);
    productInfo.appendChild(author);
    productInfo.appendChild(priceContainer);
    productInfo.appendChild(addToCartButton);

    return productInfo;
  }

  private createProductTitle(index: number): HTMLElement {
    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = `Названіе книгі ${index}`;
    return title;
  }

  private createProductAuthor(index: number): HTMLElement {
    const author = document.createElement('p');
    author.className = 'product-author';
    author.textContent = `Автор ${index}`;
    return author;
  }

  private createPriceContainer(index: number): HTMLElement {
    const hasDiscount = index % 3 === 0;
    const originalPrice = 1000 + index * 100;
    const discountPrice = hasDiscount ? Math.round(originalPrice * 0.8) : null;

    const priceContainer = document.createElement('div');
    priceContainer.className = 'product-price';

    if (hasDiscount && discountPrice) {
      const currentPrice = document.createElement('span');
      currentPrice.className = 'price-current';
      currentPrice.textContent = `${discountPrice}$`;

      const originalPriceSpan = document.createElement('span');
      originalPriceSpan.className = 'price-original';
      originalPriceSpan.textContent = `${originalPrice}$`;

      priceContainer.appendChild(currentPrice);
      priceContainer.appendChild(originalPriceSpan);
    } else {
      const currentPrice = document.createElement('span');
      currentPrice.className = 'price-current';
      currentPrice.textContent = `${originalPrice}$`;
      priceContainer.appendChild(currentPrice);
    }

    return priceContainer;
  }

  private createAddToCartButton(key: string): HTMLElement {
    const addToCartButton = document.createElement('button');
    addToCartButton.className = 'add-to-cart-btn';
    addToCartButton.textContent = 'В корзіну';
    addToCartButton.setAttribute('data-key', key);
    return addToCartButton;
  }
}
