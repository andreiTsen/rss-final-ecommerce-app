import './catalog.css';
import { ProductService, ProductData, ProductFilters, FilterOptions } from '../../services/productService';
import { CategoryService, CategoryData } from '../../services/categoryService';

export class CatalogPage {
  private container: HTMLElement;
  private products: ProductData[] = [];
  private categories: CategoryData[] = [];
  private filterOptions: FilterOptions = {
    authors: [],
    priceRange: { min: 0, max: 10000 },
  };
  private currentFilters: ProductFilters = {};

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
      const [categories, products, filterOptions] = await Promise.all([
        CategoryService.getCategories(),
        ProductService.getProducts(12, this.currentFilters),
        ProductService.getFilterOptions(),
      ]);

      this.categories = categories;
      this.products = products;
      this.filterOptions = filterOptions;
    } catch (error) {
      console.error('Ошібка загрузкі каталога:', error);
      this.showErrorMessage();
    }
  }

  private render(): void {
    this.container.innerHTML = '';

    const catalogContainer = document.createElement('div');
    catalogContainer.className = 'catalog-container';

    const headerAndFiltersPanel = this.createHeaderAndFiltersPanel();
    catalogContainer.appendChild(headerAndFiltersPanel);

    const catalogContent = document.createElement('div');
    catalogContent.className = 'catalog-content';

    const sidebar = this.createSidebar();
    catalogContent.appendChild(sidebar);

    const mainContent = this.createMainContent();
    catalogContent.appendChild(mainContent);

    catalogContainer.appendChild(catalogContent);
    this.container.appendChild(catalogContainer);
  }

  private createHeaderAndFiltersPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'header-and-filters-panel';

    const catalogHeader = this.createCatalogHeaderSection();
    const activeFiltersSection = this.createActiveFiltersSection();

    panel.appendChild(catalogHeader);
    panel.appendChild(activeFiltersSection);

    return panel;
  }

  private createCatalogHeaderSection(): HTMLElement {
    const catalogHeader = document.createElement('div');
    catalogHeader.className = 'catalog-header-section';

    const title = document.createElement('h1');
    title.className = 'catalog-title';
    title.textContent = 'Каталог товаров';

    catalogHeader.appendChild(title);
    return catalogHeader;
  }

  private createActiveFiltersSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'active-filters-section';

    const activeFiltersCount = this.getActiveFiltersCount();
    const filtersHeader = this.createFiltersHeader(activeFiltersCount);
    section.appendChild(filtersHeader);

    if (activeFiltersCount > 0) {
      const filtersList = this.createActiveFiltersList();
      section.appendChild(filtersList);
    } else {
      const noFiltersMessage = this.createNoFiltersMessage();
      section.appendChild(noFiltersMessage);
    }

    return section;
  }

  private createFiltersHeader(activeFiltersCount: number): HTMLElement {
    const filtersHeader = document.createElement('div');
    filtersHeader.className = 'filters-header';

    const filtersTitle = document.createElement('span');
    filtersTitle.className = 'filters-title';

    if (activeFiltersCount > 0) {
      const clearAllButton = document.createElement('button');
      clearAllButton.className = 'clear-all-filters-btn';
      clearAllButton.textContent = 'Сбросіть все';
      clearAllButton.addEventListener('click', () => void this.clearAllFilters());
      filtersHeader.appendChild(clearAllButton);
    } else {
      filtersTitle.textContent = ``;
    }

    filtersHeader.appendChild(filtersTitle);
    return filtersHeader;
  }

  private createActiveFiltersList(): HTMLElement {
    const filtersList = document.createElement('div');
    filtersList.className = 'active-filters-list';
    this.addActiveFilterTags(filtersList);
    return filtersList;
  }

  private createNoFiltersMessage(): HTMLElement {
    const noFiltersMessage = document.createElement('div');
    noFiltersMessage.className = 'no-filters-message';

    const noFiltersText = document.createElement('span');
    noFiltersText.className = 'no-filters-text';

    noFiltersMessage.appendChild(noFiltersText);
    return noFiltersMessage;
  }

  private addActiveFilterTags(container: HTMLElement): void {
    this.addCategoryFilterTag(container);
    this.addSearchFilterTag(container);
    this.addPriceFilterTag(container);
    this.addAuthorFilterTag(container);
    this.addDiscountFilterTag(container);
  }

  private addCategoryFilterTag(container: HTMLElement): void {
    if (this.currentFilters.categoryId) {
      const category = this.categories.find((cat) => cat.id === this.currentFilters.categoryId);
      const categoryName = category ? category.name : 'Неизвестная категория';

      const tag = this.createFilterTag(`${categoryName}`, () => void this.removeFilter('categoryId'));
      container.appendChild(tag);
    }
  }

  private addSearchFilterTag(container: HTMLElement): void {
    if (this.currentFilters.searchText) {
      const tag = this.createFilterTag(
        `"${this.currentFilters.searchText}"`,
        () => void this.removeFilter('searchText')
      );
      container.appendChild(tag);
    }
  }

  private addPriceFilterTag(container: HTMLElement): void {
    if (this.currentFilters.priceRange) {
      const { min, max } = this.currentFilters.priceRange;
      let priceText = 'price ';

      if (min !== undefined && max !== undefined) {
        priceText += `${min}₽ - ${max}₽`;
      } else if (min !== undefined) {
        priceText += `от ${min}$`;
      } else if (max !== undefined) {
        priceText += `до ${max}$`;
      }

      const tag = this.createFilterTag(priceText, () => void this.removeFilter('priceRange'));
      container.appendChild(tag);
    }
  }

  private addAuthorFilterTag(container: HTMLElement): void {
    if (this.currentFilters.author) {
      const tag = this.createFilterTag(`author ${this.currentFilters.author}`, () => void this.removeFilter('author'));
      container.appendChild(tag);
    }
  }

  private addDiscountFilterTag(container: HTMLElement): void {
    if (this.currentFilters.hasDiscount) {
      const tag = this.createFilterTag('Только со скидкой', () => void this.removeFilter('hasDiscount'));
      container.appendChild(tag);
    }
  }

  private createFilterTag(text: string, onRemove: () => void): HTMLElement {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';

    const label = document.createElement('span');
    label.className = 'filter-tag-label';
    label.textContent = text;

    const removeButton = document.createElement('button');
    removeButton.className = 'filter-tag-remove';
    removeButton.textContent = '×';
    removeButton.title = 'Удалить фильтр';
    removeButton.addEventListener('click', onRemove);

    tag.appendChild(label);
    tag.appendChild(removeButton);

    return tag;
  }

  private async removeFilter(filterKey: keyof ProductFilters): Promise<void> {
    switch (filterKey) {
      case 'categoryId':
        await this.updateCategoryFilter(undefined);
        break;
      case 'searchText':
        await this.updateSearchFilter(undefined);
        break;
      case 'priceRange':
        await this.updatePriceFilter(undefined);
        break;
      case 'author':
        await this.updateAuthorFilter(undefined);
        break;
      case 'hasDiscount':
        await this.updateDiscountFilter(undefined);
        break;
      default:
        break;
    }
  }

  private createSidebar(): HTMLElement {
    const sidebar = document.createElement('aside');
    sidebar.className = 'catalog-sidebar';

    const sidebarHeader = this.createSidebarHeader();
    sidebar.appendChild(sidebarHeader);

    const searchSection = this.createSearchSection();
    sidebar.appendChild(searchSection);

    const categoriesSection = this.createCategoriesSection();
    sidebar.appendChild(categoriesSection);

    const priceSection = this.createPriceFilterSection();
    sidebar.appendChild(priceSection);

    const authorSection = this.createAuthorFilterSection();
    sidebar.appendChild(authorSection);

    const discountSection = this.createDiscountFilterSection();
    sidebar.appendChild(discountSection);

    return sidebar;
  }

  private createSidebarHeader(): HTMLElement {
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'sidebar-header';

    const sidebarTitle = document.createElement('h2');
    sidebarTitle.className = 'sidebar-title';
    sidebarTitle.textContent = 'Фильтры';

    const toggleButton = document.createElement('button');
    toggleButton.className = 'sidebar-toggle';
    toggleButton.textContent = 'Показать ілі скрыть фільтры';
    toggleButton.title = 'Показать ілі скрыть фильтры';
    toggleButton.addEventListener('click', () => this.toggleSidebar());

    sidebarHeader.appendChild(sidebarTitle);
    sidebarHeader.appendChild(toggleButton);

    return sidebarHeader;
  }

  private toggleSidebar(): void {
    const sidebar = document.querySelector('.catalog-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('sidebar-collapsed');
    }
  }

  private createSearchSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'filter-section search-section';

    const title = this.createSectionTitle('Поиск товаров');
    const searchContainer = this.createSearchContainer();

    section.appendChild(title);
    section.appendChild(searchContainer);

    return section;
  }

  private createSectionTitle(text: string): HTMLElement {
    const title = document.createElement('h3');
    title.className = 'filter-title';
    title.textContent = text;
    return title;
  }

  private createSearchContainer(): HTMLElement {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchInput = this.createSearchInput();
    const clearSearchButton = this.createClearSearchButton(searchInput);

    this.setupSearchInputListener(searchInput, clearSearchButton);

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearSearchButton);

    return searchContainer;
  }

  private createSearchInput(): HTMLInputElement {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Введите название книги...';
    searchInput.value = this.currentFilters.searchText || '';
    return searchInput;
  }

  private createClearSearchButton(searchInput: HTMLInputElement): HTMLButtonElement {
    const clearSearchButton = document.createElement('button');
    clearSearchButton.className = 'clear-search-btn';
    clearSearchButton.textContent = '×';
    clearSearchButton.title = 'Очистить поиск';
    clearSearchButton.style.display = this.currentFilters.searchText ? 'block' : 'none';

    clearSearchButton.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchButton.style.display = 'none';
      void this.updateSearchFilter(undefined);
    });

    return clearSearchButton;
  }

  private setupSearchInputListener(searchInput: HTMLInputElement, clearSearchButton: HTMLButtonElement): void {
    let searchTimeout: NodeJS.Timeout;

    searchInput.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = target.value.trim();

        clearSearchButton.style.display = value ? 'block' : 'none';

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          void this.updateSearchFilter(value || undefined);
        }, 500);
      }
    });
  }

  private createCategoriesSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'filter-section categories-section';

    const title = this.createSectionTitle('Категории');
    const categoriesList = this.createCategoriesList();

    section.appendChild(title);
    section.appendChild(categoriesList);

    return section;
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
    if (!this.currentFilters.categoryId) {
      allProductsLink.classList.add('active');
    }
    allProductsLink.textContent = 'Все товары';
    allProductsLink.addEventListener('click', (event) => {
      event.preventDefault();
      void this.updateCategoryFilter(undefined);
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
    if (this.currentFilters.categoryId === category.id) {
      link.classList.add('active');
    }

    link.textContent = category.name;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      void this.updateCategoryFilter(category.id);
    });

    listItem.appendChild(link);
    return listItem;
  }

  private createPriceFilterSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'filter-section price-filter-section';

    const title = this.createSectionTitle('Цена');
    const priceContainer = this.createPriceContainer();

    section.appendChild(title);
    section.appendChild(priceContainer);

    return section;
  }

  private createPriceContainer(): HTMLElement {
    const priceContainer = document.createElement('div');
    priceContainer.className = 'price-filter-container';

    const minPriceContainer = this.createMinPriceContainer();
    const maxPriceContainer = this.createMaxPriceContainer();
    const priceButtonsContainer = this.createPriceButtonsContainer(minPriceContainer, maxPriceContainer);

    priceContainer.appendChild(minPriceContainer);
    priceContainer.appendChild(maxPriceContainer);
    priceContainer.appendChild(priceButtonsContainer);

    return priceContainer;
  }

  private createMinPriceContainer(): HTMLElement {
    const minPriceContainer = document.createElement('div');
    minPriceContainer.className = 'price-input-container';

    const minLabel = document.createElement('label');
    minLabel.textContent = 'От ($)';

    const minPriceInput = document.createElement('input');
    minPriceInput.type = 'number';
    minPriceInput.className = 'price-input';
    minPriceInput.placeholder = '0';
    minPriceInput.min = '0';
    minPriceInput.value = this.currentFilters.priceRange?.min?.toString() || '';

    minPriceContainer.appendChild(minLabel);
    minPriceContainer.appendChild(minPriceInput);

    return minPriceContainer;
  }

  private createMaxPriceContainer(): HTMLElement {
    const maxPriceContainer = document.createElement('div');
    maxPriceContainer.className = 'price-input-container';

    const maxLabel = document.createElement('label');
    maxLabel.textContent = 'До ($)';

    const maxPriceInput = document.createElement('input');
    maxPriceInput.type = 'number';
    maxPriceInput.className = 'price-input';
    maxPriceInput.placeholder = '10000';
    maxPriceInput.min = '0';
    maxPriceInput.value = this.currentFilters.priceRange?.max?.toString() || '';

    maxPriceContainer.appendChild(maxLabel);
    maxPriceContainer.appendChild(maxPriceInput);

    return maxPriceContainer;
  }

  private createPriceButtonsContainer(minContainer: HTMLElement, maxContainer: HTMLElement): HTMLElement {
    const priceButtonsContainer = document.createElement('div');
    priceButtonsContainer.className = 'price-buttons-container';

    const applyButton = this.createApplyPriceButton(minContainer, maxContainer);
    const resetPriceButton = this.createResetPriceButton(minContainer, maxContainer);

    priceButtonsContainer.appendChild(applyButton);
    priceButtonsContainer.appendChild(resetPriceButton);

    return priceButtonsContainer;
  }

  private createApplyPriceButton(minContainer: HTMLElement, maxContainer: HTMLElement): HTMLButtonElement {
    const applyButton = document.createElement('button');
    applyButton.className = 'apply-price-btn';
    applyButton.textContent = 'Применить';

    applyButton.addEventListener('click', () => {
      const minInput = minContainer.querySelector('.price-input');
      const maxInput = maxContainer.querySelector('.price-input');

      if (minInput instanceof HTMLInputElement && maxInput instanceof HTMLInputElement) {
        const min = minInput.value ? parseFloat(minInput.value) : undefined;
        const max = maxInput.value ? parseFloat(maxInput.value) : undefined;

        void this.updatePriceFilter(min !== undefined || max !== undefined ? { min, max } : undefined);
      }
    });

    return applyButton;
  }

  private createResetPriceButton(minContainer: HTMLElement, maxContainer: HTMLElement): HTMLButtonElement {
    const resetPriceButton = document.createElement('button');
    resetPriceButton.className = 'reset-price-btn';
    resetPriceButton.textContent = 'Сбросить';

    resetPriceButton.addEventListener('click', () => {
      const minInput = minContainer.querySelector('.price-input');
      const maxInput = maxContainer.querySelector('.price-input');

      if (minInput instanceof HTMLInputElement && maxInput instanceof HTMLInputElement) {
        minInput.value = '';
        maxInput.value = '';
        void this.updatePriceFilter(undefined);
      }
    });

    return resetPriceButton;
  }

  private createAuthorFilterSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'filter-section author-filter-section';

    const title = this.createSectionTitle('Автор');

    if (!this.filterOptions?.authors || this.filterOptions.authors.length === 0) {
      const noAuthorsMessage = this.createNoAuthorsMessage();
      section.appendChild(title);
      section.appendChild(noAuthorsMessage);
      return section;
    }

    const authorContainer = this.createAuthorContainer();
    section.appendChild(title);
    section.appendChild(authorContainer);

    return section;
  }

  private createNoAuthorsMessage(): HTMLElement {
    const noAuthorsMessage = document.createElement('p');
    noAuthorsMessage.className = 'no-options-message';
    noAuthorsMessage.textContent = 'Авторы не найдены';
    return noAuthorsMessage;
  }

  private createAuthorContainer(): HTMLElement {
    const authorContainer = document.createElement('div');
    authorContainer.className = 'author-filter-container';

    const authorSelect = this.createAuthorSelect();
    const resetAuthorButton = this.createResetAuthorButton(authorSelect);

    authorContainer.appendChild(authorSelect);
    authorContainer.appendChild(resetAuthorButton);

    return authorContainer;
  }

  private createAuthorSelect(): HTMLSelectElement {
    const authorSelect = document.createElement('select');
    authorSelect.className = 'author-select';

    const allAuthorsOption = document.createElement('option');
    allAuthorsOption.value = '';
    allAuthorsOption.textContent = 'Все авторы';
    authorSelect.appendChild(allAuthorsOption);

    if (this.filterOptions?.authors) {
      this.filterOptions.authors.forEach((author) => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        if (this.currentFilters.author === author) {
          option.selected = true;
        }
        authorSelect.appendChild(option);
      });
    }

    authorSelect.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement) {
        void this.updateAuthorFilter(target.value || undefined);
      }
    });

    return authorSelect;
  }

  private createResetAuthorButton(authorSelect: HTMLSelectElement): HTMLButtonElement {
    const resetAuthorButton = document.createElement('button');
    resetAuthorButton.className = 'reset-author-btn';
    resetAuthorButton.textContent = 'Сбросить';
    resetAuthorButton.style.display = this.currentFilters.author ? 'block' : 'none';

    resetAuthorButton.addEventListener('click', () => {
      authorSelect.value = '';
      resetAuthorButton.style.display = 'none';
      void this.updateAuthorFilter(undefined);
    });

    return resetAuthorButton;
  }

  private createDiscountFilterSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'filter-section discount-filter-section';

    const title = this.createSectionTitle('Скидки');
    const discountContainer = this.createDiscountContainer();

    section.appendChild(title);
    section.appendChild(discountContainer);

    return section;
  }

  private createDiscountContainer(): HTMLElement {
    const discountContainer = document.createElement('div');
    discountContainer.className = 'discount-filter-container';

    const checkboxContainer = this.createDiscountCheckboxContainer();
    discountContainer.appendChild(checkboxContainer);

    return discountContainer;
  }

  private createDiscountCheckboxContainer(): HTMLElement {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox-container';

    const discountCheckbox = document.createElement('input');
    discountCheckbox.type = 'checkbox';
    discountCheckbox.id = 'discount-filter';
    discountCheckbox.className = 'discount-checkbox';
    discountCheckbox.checked = this.currentFilters.hasDiscount || false;

    const discountLabel = document.createElement('label');
    discountLabel.htmlFor = 'discount-filter';
    discountLabel.className = 'discount-label';
    discountLabel.textContent = 'Только товары со скидкой';

    discountCheckbox.addEventListener('change', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        void this.updateDiscountFilter(target.checked || undefined);
      }
    });

    checkboxContainer.appendChild(discountCheckbox);
    checkboxContainer.appendChild(discountLabel);

    return checkboxContainer;
  }

  private createMainContent(): HTMLElement {
    const mainContent = document.createElement('main');
    mainContent.className = 'catalog-main';

    const resultsInfo = this.createResultsInfo();
    mainContent.appendChild(resultsInfo);

    const productsGrid = this.createProductsGrid();
    mainContent.appendChild(productsGrid);

    return mainContent;
  }

  private createResultsInfo(): HTMLElement {
    const resultsInfo = document.createElement('div');
    resultsInfo.className = 'results-info';

    const count = this.products.length;
    const text = count === 1 ? 'товар' : count < 5 ? 'товара' : 'товаров';

    const countText = document.createElement('span');
    countText.className = 'results-count';
    countText.textContent = `Найдено ${count} ${text}`;

    const activeFiltersCount = this.getActiveFiltersCount();
    if (activeFiltersCount > 0) {
      const filtersText = document.createElement('span');
      filtersText.className = 'results-filters';
      filtersText.textContent = ` (применено фильтров: ${activeFiltersCount})`;
      resultsInfo.appendChild(countText);
      resultsInfo.appendChild(filtersText);
    } else {
      resultsInfo.appendChild(countText);
    }

    return resultsInfo;
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

    const activeFiltersCount = this.getActiveFiltersCount();
    if (activeFiltersCount > 0) {
      this.createNoProductsWithFilters(noProductsMessage);
    } else {
      this.createNoProductsWithoutFilters(noProductsMessage);
    }

    return noProductsMessage;
  }

  private createNoProductsWithFilters(container: HTMLElement): void {
    const noProductsIcon = document.createElement('div');
    noProductsIcon.className = 'no-products-icon';
    noProductsIcon.textContent = 'товары не найдены';

    const title = document.createElement('h3');
    title.textContent = 'Товары не найдены';

    const description1 = document.createElement('p');
    description1.textContent = 'По выбранным фильтрам товары не найдены.';

    const description2 = document.createElement('p');
    description2.textContent = 'Попробуйте изменить критерии поиска или сбросить фильтры.';

    const resetButton = document.createElement('button');
    resetButton.className = 'reset-filters-btn';
    resetButton.textContent = 'Сбросить все фильтры';
    resetButton.addEventListener('click', () => {
      const clearAllButton = document.querySelector('.clear-all-filters-btn');
      if (clearAllButton instanceof HTMLButtonElement) {
        clearAllButton.click();
      }
    });

    container.appendChild(noProductsIcon);
    container.appendChild(title);
    container.appendChild(description1);
    container.appendChild(description2);
    container.appendChild(resetButton);
  }

  private createNoProductsWithoutFilters(container: HTMLElement): void {
    const noProductsIcon = document.createElement('div');
    noProductsIcon.className = 'no-products-icon';
    noProductsIcon.textContent = 'Товары отсутствуют';

    const title = document.createElement('h3');
    title.textContent = 'Товары отсутствуют';

    const description = document.createElement('p');
    description.textContent = 'В данный момент товары недоступны.';

    container.appendChild(noProductsIcon);
    container.appendChild(title);
    container.appendChild(description);
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

    const image = document.createElement('img');
    image.src =
      product.imageUrl || `https://via.placeholder.com/200x280/4a90e2/ffffff?text=${encodeURIComponent(product.name)}`;
    image.alt = product.name;
    image.className = 'product-image';

    imageContainer.appendChild(image);
    if (product.hasDiscount) {
      const discountBadge = document.createElement('span');
      discountBadge.className = 'discount-badge';
      const discountPercent = product.discountPercentage || 20;
      discountBadge.textContent = `-${discountPercent}%`;
      imageContainer.appendChild(discountBadge);
    }

    return imageContainer;
  }

  private createProductInfo(product: ProductData): HTMLElement {
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';

    const title = this.createProductTitle(product);
    const description = this.createProductDescription(product);
    const author = this.createProductAuthor(product);
    const category = this.createProductCategory(product);
    const priceContainer = this.createProductPriceContainer(product);
    const buttonsContainer = this.createButtonsContainer(product);

    productInfo.appendChild(title);
    productInfo.appendChild(description);
    productInfo.appendChild(author);
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

    const maxLength = 100;
    const text = product.description || 'Описание отсутствует';
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    description.textContent = truncatedText;
    return description;
  }

  private createProductAuthor(product: ProductData): HTMLElement {
    const author = document.createElement('p');
    author.className = 'product-author';
    author.textContent = product.author ? `Автор: ${product.author}` : 'Автор не указан';
    return author;
  }

  private createProductCategory(product: ProductData): HTMLElement {
    const category = document.createElement('p');
    category.className = 'product-category';
    category.textContent = `Категория: ${product.category || 'Без категории'}`;
    return category;
  }

  private createProductPriceContainer(product: ProductData): HTMLElement {
    const priceContainer = document.createElement('div');
    priceContainer.className = 'product-price';

    if (product.hasDiscount && product.originalPrice) {
      this.addDiscountPriceElements(priceContainer, product);
    } else {
      this.addRegularPriceElement(priceContainer, product);
    }

    return priceContainer;
  }

  private addDiscountPriceElements(container: HTMLElement, product: ProductData): void {
    const currentPrice = document.createElement('span');
    currentPrice.className = 'price-current';
    currentPrice.textContent = `${product.price.toFixed(2)}$`;

    const originalPriceSpan = document.createElement('span');
    originalPriceSpan.className = 'price-original';
    originalPriceSpan.textContent = `${product.originalPrice!.toFixed(2)}$`;

    const savings = document.createElement('span');
    savings.className = 'price-savings';

    container.appendChild(currentPrice);
    container.appendChild(originalPriceSpan);
    container.appendChild(savings);
  }

  private addRegularPriceElement(container: HTMLElement, product: ProductData): void {
    const currentPrice = document.createElement('span');
    currentPrice.className = 'price-current';
    currentPrice.textContent = `${product.price.toFixed(2)}$`;
    container.appendChild(currentPrice);
  }

  private createButtonsContainer(product: ProductData): HTMLElement {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'product-buttons';

    const detailsButton = this.createDetailsButton(product);
    const addToCartButton = this.createAddToCartButton(product);

    buttonsContainer.appendChild(detailsButton);
    buttonsContainer.appendChild(addToCartButton);

    return buttonsContainer;
  }

  private createDetailsButton(product: ProductData): HTMLElement {
    const detailsButton = document.createElement('button');
    detailsButton.className = 'details-btn';
    detailsButton.textContent = 'Подробнее';

    detailsButton.setAttribute('data-key', product.name);

    detailsButton.addEventListener('click', () => {
      this.viewProductDetails(product);
    });

    return detailsButton;
  }

  private createAddToCartButton(product: ProductData): HTMLElement {
    const addToCartButton = document.createElement('button');
    addToCartButton.className = 'add-to-cart-btn';
    addToCartButton.textContent = 'В корзіну';
    addToCartButton.addEventListener('click', (event) => {
      this.addToCart(product, event);
    });
    return addToCartButton;
  }

  private async updateCategoryFilter(categoryId: string | undefined): Promise<void> {
    if (categoryId === undefined) {
      delete this.currentFilters.categoryId;
    } else {
      this.currentFilters.categoryId = categoryId;
    }

    await this.applyFilters();
  }

  private async updateSearchFilter(searchText: string | undefined): Promise<void> {
    if (searchText === undefined || searchText === '') {
      delete this.currentFilters.searchText;
    } else {
      this.currentFilters.searchText = searchText;
    }

    await this.applyFilters();
  }

  private async updatePriceFilter(priceRange: { min?: number; max?: number } | undefined): Promise<void> {
    if (priceRange === undefined) {
      delete this.currentFilters.priceRange;
    } else {
      this.currentFilters.priceRange = priceRange;
    }

    await this.applyFilters();
  }

  private async updateAuthorFilter(author: string | undefined): Promise<void> {
    if (author === undefined || author === '') {
      delete this.currentFilters.author;
    } else {
      this.currentFilters.author = author;
    }

    await this.applyFilters();
  }

  private async updateDiscountFilter(hasDiscount: boolean | undefined): Promise<void> {
    if (hasDiscount === undefined || hasDiscount === false) {
      delete this.currentFilters.hasDiscount;
    } else {
      this.currentFilters.hasDiscount = hasDiscount;
    }

    await this.applyFilters();
  }

  private async applyFilters(): Promise<void> {
    try {
      this.showLoadingIndicator();
      this.products = await ProductService.getProducts(12, this.currentFilters);
      this.render();
    } catch (error) {
      console.error('Ошібка фильтров:', error);
      this.showErrorMessage();
    }
  }

  private getActiveFiltersCount(): number {
    let count = 0;

    if (this.currentFilters.categoryId) count++;
    if (this.currentFilters.searchText) count++;
    if (this.currentFilters.priceRange) count++;
    if (this.currentFilters.author) count++;
    if (this.currentFilters.hasDiscount) count++;

    return count;
  }

  private async clearAllFilters(): Promise<void> {
    this.currentFilters = {};

    try {
      this.showLoadingIndicator();
      this.products = await ProductService.getProducts(12);
      this.render();
    } catch (error) {
      console.error('Ошібка сброса фільтров:', error);
      this.showErrorMessage();
    }
  }

  private viewProductDetails(product: ProductData): void {
    console.log(`Товар: ${product.name}\nЦена: ${product.price}₽\nКатегория: ${product.category}`);
  }

  private addToCart(product: ProductData, event: Event): void {
    console.log('Добавленіе в корзіну:', product);
    if (event.target instanceof HTMLButtonElement) {
      const button = event.target;
      const originalText = button.textContent;
      button.textContent = 'Добавлено!';
      button.disabled = true;

      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1500);
    }
  }

  private showLoadingIndicator(): void {
    this.container.innerHTML = '';
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';

    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';

    const loadingText = document.createElement('p');
    loadingText.textContent = 'Загрузка товаров...';

    loadingDiv.appendChild(loadingSpinner);
    loadingDiv.appendChild(loadingText);

    this.container.appendChild(loadingDiv);
  }

  private showErrorMessage(): void {
    this.container.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';

    const errorTitle = document.createElement('h2');
    errorTitle.textContent = 'Ошібка загрузки';

    const errorText = document.createElement('p');
    errorText.textContent = 'Не удалось загрузіть товары. Попробуйте позже.';

    const retryButton = document.createElement('button');
    retryButton.className = 'retry-btn';
    retryButton.textContent = 'Попробовать снова';
    retryButton.addEventListener('click', () => {
      location.reload();
    });

    errorDiv.appendChild(errorTitle);
    errorDiv.appendChild(errorText);
    errorDiv.appendChild(retryButton);

    this.container.appendChild(errorDiv);
  }
}
