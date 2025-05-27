import './catalog.css';
import { ProductService, ProductData } from '../../services/productService';
import { CategoryService, CategoryData } from '../../services/categoryService';

export class CatalogPage {
  private container: HTMLElement;
  private products: ProductData[] = [];
  private categories: CategoryData[] = [];
  private currentCategoryId: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    void this.init();
  }

  private async init(): Promise<void> {
    await this.loadData();
    this.render();
  }

  private async loadData(): Promise<void> {
    try {
      const [categories, products] = await Promise.all([
        CategoryService.getCategories(),
        ProductService.getProducts(12),
      ]);

      this.categories = categories;
      this.products = products;
    } catch (error) {
      console.error('Ошібка загрузкі данных:', error);
      this.showErrorMessage();
    }
  }

  private render(): void {
    const catalogContainer = document.createElement('div');
    catalogContainer.className = 'catalog-container';

    const catalogHeader = this.createCatalogHeader();
    catalogContainer.appendChild(catalogHeader);

    const catalogContent = document.createElement('div');
    catalogContent.className = 'catalog-content';

    const sidebar = this.createSidebar();
    catalogContent.appendChild(sidebar);

    const mainContent = this.createMainContent();
    catalogContent.appendChild(mainContent);

    catalogContainer.appendChild(catalogContent);
    this.container.appendChild(catalogContainer);
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

    const title = this.createCategoriesSectionTitle();
    const categoriesList = this.createCategoriesList();

    section.appendChild(title);
    section.appendChild(categoriesList);

    return section;
  }

  private createCategoriesSectionTitle(): HTMLElement {
    const title = document.createElement('h3');
    title.className = 'sidebar-title';
    title.textContent = 'Категории';
    return title;
  }

  private createCategoriesList(): HTMLElement {
    const categoriesList = document.createElement('ul');
    categoriesList.className = 'categories-list';

    const allProductsItem = this.createAllProductsItem();
    categoriesList.appendChild(allProductsItem);

    this.categories.forEach((category) => {
      const categoryItem = this.createCategoryItem(category);
      categoriesList.appendChild(categoryItem);
    });

    return categoriesList;
  }

  private createAllProductsItem(): HTMLElement {
    const allProductsItem = document.createElement('li');
    allProductsItem.className = 'category-item';

    const allProductsLink = document.createElement('a');
    allProductsLink.href = '#';
    allProductsLink.className = 'category-link';
    if (!this.currentCategoryId) {
      allProductsLink.classList.add('active');
    }
    allProductsLink.textContent = 'Все товары';
    allProductsLink.addEventListener('click', (event) => {
      event.preventDefault();
      void this.filterByCategory(null);
    });

    allProductsItem.appendChild(allProductsLink);
    return allProductsItem;
  }

  private createCategoryItem(category: CategoryData): HTMLElement {
    const listItem = document.createElement('li');
    listItem.className = 'category-item';

    const link = document.createElement('a');
    link.href = '#';
    link.className = 'category-link';
    if (this.currentCategoryId === category.id) {
      link.classList.add('active');
    }
    link.textContent = category.name;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      void this.filterByCategory(category.id);
    });

    listItem.appendChild(link);
    return listItem;
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

    if (this.products.length === 0) {
      const noProductsMessage = this.createNoProductsMessage();
      grid.appendChild(noProductsMessage);
      return grid;
    }

    this.products.forEach((product) => {
      const productCard = this.createProductCard(product);
      grid.appendChild(productCard);
    });

    return grid;
  }

  private createNoProductsMessage(): HTMLElement {
    const noProductsMessage = document.createElement('div');
    noProductsMessage.className = 'no-products-message';

    if (this.currentCategoryId) {
      noProductsMessage.textContent = 'В этой категории нет товаров';
    } else {
      noProductsMessage.textContent = 'Товары не найдены ілі в проекте нет опубликованных товаров.';
    }

    return noProductsMessage;
  }

  private createProductCard(product: ProductData): HTMLElement {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = this.createImageContainer(product);
    const productInfo = this.createProductInfo(product);

    card.appendChild(imageContainer);
    card.appendChild(productInfo);

    return card;
  }

  private createImageContainer(product: ProductData): HTMLElement {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image-container';

    const image = this.createProductImage(product);
    imageContainer.appendChild(image);

    if (product.hasDiscount) {
      const discountBadge = this.createDiscountBadge(product);
      imageContainer.appendChild(discountBadge);
    }

    return imageContainer;
  }

  private createProductImage(product: ProductData): HTMLElement {
    const image = document.createElement('img');
    image.src =
      product.imageUrl || `https://via.placeholder.com/200x280/4a90e2/ffffff?text=${encodeURIComponent(product.name)}`;
    image.alt = product.name;
    image.className = 'product-image';
    return image;
  }

  private createDiscountBadge(product: ProductData): HTMLElement {
    const discountBadge = document.createElement('span');
    discountBadge.className = 'discount-badge';
    const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 20;
    discountBadge.textContent = `-${discountPercent}%`;
    return discountBadge;
  }

  private createProductInfo(product: ProductData): HTMLElement {
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';

    const title = this.createProductTitle(product);
    const description = this.createProductDescription(product);
    const category = this.createProductCategory(product);
    const priceContainer = this.createPriceContainer(product);
    const buttonsContainer = this.createButtonsContainer(product);

    productInfo.appendChild(title);
    productInfo.appendChild(description);
    productInfo.appendChild(category);
    productInfo.appendChild(priceContainer);
    productInfo.appendChild(buttonsContainer);

    return productInfo;
  }

  private createProductTitle(product: ProductData): HTMLElement {
    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.name;
    return title;
  }

  private createProductDescription(product: ProductData): HTMLElement {
    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description || 'Описание отсутствует';
    return description;
  }

  private createProductCategory(product: ProductData): HTMLElement {
    const category = document.createElement('p');
    category.className = 'product-category';
    category.textContent = product.category || 'Без категории';
    return category;
  }

  private createPriceContainer(product: ProductData): HTMLElement {
    const priceContainer = document.createElement('div');
    priceContainer.className = 'product-price';

    if (product.hasDiscount && product.originalPrice) {
      this.addDiscountedPrice(priceContainer, product);
    } else {
      this.addRegularPrice(priceContainer, product);
    }

    return priceContainer;
  }

  private addDiscountedPrice(container: HTMLElement, product: ProductData): void {
    const currentPrice = document.createElement('span');
    currentPrice.className = 'price-current';
    currentPrice.textContent = `${product.price.toFixed(2)}₽`;

    const originalPriceSpan = document.createElement('span');
    originalPriceSpan.className = 'price-original';
    originalPriceSpan.textContent = `${product.originalPrice!.toFixed(2)}₽`;

    container.appendChild(currentPrice);
    container.appendChild(originalPriceSpan);
  }

  private addRegularPrice(container: HTMLElement, product: ProductData): void {
    const currentPrice = document.createElement('span');
    currentPrice.className = 'price-current';
    currentPrice.textContent = `${product.price.toFixed(2)}₽`;
    container.appendChild(currentPrice);
  }

  private createButtonsContainer(product: ProductData): HTMLElement {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'product-buttons';

    const detailsButton = this.createDetailsButton(product);
    buttonsContainer.appendChild(detailsButton);

    const addToCartButton = this.createAddToCartButton(product);
    buttonsContainer.appendChild(addToCartButton);

    return buttonsContainer;
  }

  private createDetailsButton(product: ProductData): HTMLElement {
    const detailsButton = document.createElement('button');
    detailsButton.className = 'details-btn';
    detailsButton.textContent = 'Подробнее';

    const productKey = this.generateProductKey(product);
    detailsButton.setAttribute('data-key', productKey);

    detailsButton.addEventListener('click', () => {
      this.viewProductDetails(product, productKey);
    });

    return detailsButton;
  }

  private createAddToCartButton(product: ProductData): HTMLElement {
    const addToCartButton = document.createElement('button');
    addToCartButton.className = 'add-to-cart-btn';
    addToCartButton.textContent = 'В корзіну';
    addToCartButton.addEventListener('click', () => {
      this.addToCart(product);
    });
    return addToCartButton;
  }

  private generateProductKey(product: ProductData): string {
    const key = product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    return key || product.id;
  }

  private viewProductDetails(product: ProductData, productKey: string): void {
    console.log('Переход к подробной Інформации о товаре:', {
      product,
      key: productKey,
    });

    console.log(`Переход к товару: ${product.name} (ключ: ${productKey})`);
  }

  private async filterByCategory(categoryId: string | null): Promise<void> {
    this.currentCategoryId = categoryId;

    try {
      this.showLoadingIndicator();

      if (categoryId) {
        console.log('Фильтрація категоріям:', categoryId);
        this.products = await ProductService.getProductsByCategory(categoryId);
      } else {
        console.log('Показываем продукты');
        this.products = await ProductService.getProducts(12);
      }

      console.log('Тест фильтрации:', this.products);

      this.container.textContent = '';
      this.render();
    } catch (error) {
      console.error('Ошибка фильтраціі по категории:', error);
      this.showErrorMessage();
    }
  }

  private addToCart(product: ProductData): void {
    console.log('Добавление в корзіну:', product);
  }

  private showLoadingIndicator(): void {
    this.container.textContent = '';
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.textContent = 'Загрузка товаров...';
    this.container.appendChild(loadingDiv);
  }

  private showErrorMessage(): void {
    this.container.textContent = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Ошібка загрузкі товаров. Попробуйте позже.';
    this.container.appendChild(errorDiv);
  }
}
