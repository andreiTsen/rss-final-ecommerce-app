import './catalog.css';
import { ProductService, ProductData, ProductFilters, FilterOptions, SortOption } from '../../services/productService';
import { CategoryService, CategoryData } from '../../services/categoryService';
import { navigateTo } from '../../main';

export class CatalogPage {
  private container: HTMLElement;
  private products: ProductData[] = [];
  private categories: CategoryData[] = [];
  private filterOptions: FilterOptions = {
    authors: [],
    priceRange: { min: 0, max: 10000 },
  };
  private currentFilters: ProductFilters = {};
  private currentSortOption: SortOption = 'default';
  private searchTimeout: NodeJS.Timeout | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initializeFromURL();
    void this.init();
  }

  private async init(): Promise<void> {
    await this.loadData();
    this.render();
    this.setupPopstateHandler();
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
    this.container.textContent = '';

    const catalogContainer = document.createElement('div');
    catalogContainer.className = 'catalog-container';

    const breadcrumbs = this.createBreadcrumbs();
    catalogContainer.appendChild(breadcrumbs);

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

  private setupPopstateHandler(): void {
    window.addEventListener('popstate', () => {
      this.initializeFromURL();
      void this.applyFilters();
    });
  }

  private initializeFromURL(): void {
    const urlParameters = new URLSearchParams(window.location.search);

    this.initializeCategoryFromURL(urlParameters);
    this.initializeFiltersFromURL(urlParameters);
    this.initializeSortFromURL(urlParameters);
  }

  private initializeCategoryFromURL(urlParameters: URLSearchParams): void {
    const categoryParameter = urlParameters.get('category');
    if (categoryParameter && categoryParameter !== 'all') {
      const category = this.categories.find((cat) => cat.slug === categoryParameter || cat.id === categoryParameter);

      if (category) {
        this.currentFilters.categoryId = category.id;
      }
    }
  }

  private initializeFiltersFromURL(urlParameters: URLSearchParams): void {
    const searchText = urlParameters.get('search');
    if (searchText) {
      this.currentFilters.searchText = searchText;
    }

    const author = urlParameters.get('author');
    if (author) {
      this.currentFilters.author = author;
    }

    const minPrice = urlParameters.get('minPrice');
    const maxPrice = urlParameters.get('maxPrice');
    if (minPrice || maxPrice) {
      this.currentFilters.priceRange = {
        min: minPrice ? parseFloat(minPrice) : undefined,
        max: maxPrice ? parseFloat(maxPrice) : undefined,
      };
    }

    const hasDiscount = urlParameters.get('discount');
    if (hasDiscount === 'true') {
      this.currentFilters.hasDiscount = true;
    }
  }

  private initializeSortFromURL(urlParameters: URLSearchParams): void {
    const sortBy = urlParameters.get('sort');
    if (sortBy && this.isSortOption(sortBy)) {
      this.currentSortOption = sortBy;
      this.currentFilters.sortBy = sortBy;
    }
  }

  private updateURL(): void {
    const url = new URL(window.location.href);
    const parameters = new URLSearchParams();

    this.addCategoryToURL(parameters);
    this.addFiltersToURL(parameters);
    this.addSortToURL(parameters);

    const newURL = parameters.toString() ? `${url.pathname}?${parameters.toString()}` : url.pathname;
    window.history.pushState({ filters: this.currentFilters }, '', newURL);
  }

  private addCategoryToURL(parameters: URLSearchParams): void {
    if (this.currentFilters.categoryId) {
      const category = this.categories.find((cat) => cat.id === this.currentFilters.categoryId);
      const categorySlug = category?.slug || this.currentFilters.categoryId;
      parameters.set('category', categorySlug);
    }
  }

  private addFiltersToURL(parameters: URLSearchParams): void {
    if (this.currentFilters.searchText) {
      parameters.set('search', this.currentFilters.searchText);
    }

    if (this.currentFilters.author) {
      parameters.set('author', this.currentFilters.author);
    }

    if (this.currentFilters.priceRange) {
      if (this.currentFilters.priceRange.min !== undefined) {
        parameters.set('minPrice', this.currentFilters.priceRange.min.toString());
      }
      if (this.currentFilters.priceRange.max !== undefined) {
        parameters.set('maxPrice', this.currentFilters.priceRange.max.toString());
      }
    }

    if (this.currentFilters.hasDiscount) {
      parameters.set('discount', 'true');
    }
  }

  private addSortToURL(parameters: URLSearchParams): void {
    if (this.currentSortOption && this.currentSortOption !== 'default') {
      parameters.set('sort', this.currentSortOption);
    }
  }

  private createBreadcrumbs(): HTMLElement {
    const breadcrumbsContainer = document.createElement('nav');
    breadcrumbsContainer.className = 'breadcrumbs';
    breadcrumbsContainer.setAttribute('aria-label', 'Навигационная цепочка');

    const breadcrumbsList = document.createElement('ol');
    breadcrumbsList.className = 'breadcrumbs-list';

    const catalogItem = this.createBreadcrumbItem(
      'Каталог',
      () => {
        void this.resetToAllProducts();
      },
      !this.currentFilters.categoryId
    );
    breadcrumbsList.appendChild(catalogItem);

    if (this.currentFilters.categoryId) {
      const currentCategory = this.categories.find((cat) => cat.id === this.currentFilters.categoryId);
      if (currentCategory) {
        const categoryItem = this.createBreadcrumbItem(currentCategory.name, undefined, true);
        breadcrumbsList.appendChild(categoryItem);
      }
    }

    breadcrumbsContainer.appendChild(breadcrumbsList);
    return breadcrumbsContainer;
  }

  private async resetToAllProducts(): Promise<void> {
    try {
      delete this.currentFilters.categoryId;

      this.updateActiveCategoryInUI(undefined);
      this.updateURL();
      await this.applyFilters();
    } catch (error) {
      console.error('Ошібка при сбросе":', error);
    }
  }

  private createBreadcrumbItem(text: string, onClick?: () => void, isActive: boolean = false): HTMLElement {
    const listItem = document.createElement('li');
    listItem.className = 'breadcrumb-item';

    if (isActive) {
      listItem.classList.add('active');
      const span = document.createElement('span');
      span.textContent = text;
      span.className = 'breadcrumb-current';
      listItem.appendChild(span);
    } else {
      const link = document.createElement('button');
      link.textContent = text;
      link.className = 'breadcrumb-link';
      link.type = 'button';

      if (onClick) {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        });
      }

      listItem.appendChild(link);

      const separator = document.createElement('span');
      separator.className = 'breadcrumb-separator';
      separator.textContent = '/';
      separator.setAttribute('aria-hidden', 'true');
      listItem.appendChild(separator);
    }

    return listItem;
  }

  private updateBreadcrumbs(): void {
    const existingBreadcrumbs = document.querySelector('.breadcrumbs');
    if (existingBreadcrumbs) {
      const newBreadcrumbs = this.createBreadcrumbs();
      existingBreadcrumbs.replaceWith(newBreadcrumbs);
    }
  }

  private isSortOption(value: string): value is SortOption {
    return ['default', 'name-asc', 'name-desc', 'price-asc', 'price-desc'].includes(value);
  }

  private createSortSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'filter-section sort-section';

    const title = this.createSectionTitle('Сортировка');
    const sortContainer = this.createSortContainer();

    section.appendChild(title);
    section.appendChild(sortContainer);

    return section;
  }

  private createSortContainer(): HTMLElement {
    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-container';

    const sortSelect = this.createSortSelect();
    sortContainer.appendChild(sortSelect);

    return sortContainer;
  }

  private createSortSelect(): HTMLSelectElement {
    const sortSelect = document.createElement('select');
    sortSelect.className = 'sort-select';

    const sortOptions = [
      { value: 'default', label: 'По умолчанию' },
      { value: 'name-asc', label: 'По алфавиту' },
      { value: 'name-desc', label: 'Протів алфавита' },
      { value: 'price-asc', label: 'Цена: по возрастанию' },
      { value: 'price-desc', label: 'Цена: по убыванию' },
    ];

    sortOptions.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      if (this.currentSortOption === option.value) {
        optionElement.selected = true;
      }
      sortSelect.appendChild(optionElement);
    });

    sortSelect.addEventListener('change', (event) => {
      const target = event.target;
      if (target && target instanceof HTMLSelectElement && this.isSortOption(target.value)) {
        void this.updateSortOption(target.value);
      }
    });

    return sortSelect;
  }

  private async updateSortOption(sortOption: SortOption): Promise<void> {
    this.currentSortOption = sortOption;
    this.currentFilters.sortBy = sortOption;
    this.updateURL();
    await this.applyFilters();
  }

  private addSortFilterTag(container: HTMLElement): void {
    if (this.currentSortOption && this.currentSortOption !== 'default') {
      const sortLabels: Record<string, string> = {
        'name-asc': 'По алфавіту',
        'name-desc': 'Протів алфавіта',
        'price-asc': 'Цена: по возрастанію',
        'price-desc': 'Цена: по убыванію',
      };

      const label = sortLabels[this.currentSortOption];
      if (label) {
        const tag = this.createFilterTag(`Сортировка: ${label}`, () => void this.updateSortOption('default'));
        container.appendChild(tag);
      }
    }
  }

  private createCatalogHeaderSection(): HTMLElement {
    const catalogHeader = document.createElement('div');
    catalogHeader.className = 'catalog-header-section';

    const title = document.createElement('h1');
    title.className = 'catalog-title';
    title.textContent = 'Crazy Bookstore';

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
      clearAllButton.addEventListener('click', (event) => {
        event.preventDefault();
        void this.clearAllFilters();
      });
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
    this.addSortFilterTag(container);
  }

  private addCategoryFilterTag(container: HTMLElement): void {
    if (this.currentFilters.categoryId) {
      const category = this.categories.find((cat) => cat.id === this.currentFilters.categoryId);
      const categoryName = category ? category.name : 'Неизвестная категория';

      const tag = this.createFilterTag(categoryName, () => void this.removeFilter('categoryId'));
      container.appendChild(tag);
    }
  }

  private addSearchFilterTag(container: HTMLElement): void {
    if (this.currentFilters.searchText) {
      const tag = this.createFilterTag(
        `Поиск: "${this.currentFilters.searchText}"`,
        () => void this.removeFilter('searchText')
      );
      container.appendChild(tag);
    }
  }

  private addPriceFilterTag(container: HTMLElement): void {
    if (this.currentFilters.priceRange) {
      const { min, max } = this.currentFilters.priceRange;
      let priceText = 'Цена: ';

      if (min !== undefined && max !== undefined) {
        priceText += `${min}$ - ${max}$`;
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
      const tag = this.createFilterTag(`Автор: ${this.currentFilters.author}`, () => void this.removeFilter('author'));
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
        this.clearSearchInput();
        break;
      case 'priceRange':
        await this.updatePriceFilter(undefined);
        this.clearPriceInputs();
        break;
      case 'author':
        await this.updateAuthorFilter(undefined);
        this.clearAuthorSelect();
        break;
      case 'hasDiscount':
        await this.updateDiscountFilter(undefined);
        this.clearDiscountCheckbox();
        break;
      default:
        break;
    }
  }

  private clearSearchInput(): void {
    const searchInput = document.querySelector('.search-input');
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = '';
    }

    const clearSearchButton = document.querySelector('.clear-search-btn');
    if (clearSearchButton instanceof HTMLButtonElement) {
      clearSearchButton.style.display = 'none';
    }
  }

  private clearPriceInputs(): void {
    const priceInputs = document.querySelectorAll('.price-input');
    priceInputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.value = '';
      }
    });
  }

  private clearAuthorSelect(): void {
    const authorSelect = document.querySelector('.author-select');
    if (authorSelect instanceof HTMLSelectElement) {
      authorSelect.value = '';
    }

    const resetAuthorButton = document.querySelector('.reset-author-btn');
    if (resetAuthorButton instanceof HTMLButtonElement) {
      resetAuthorButton.style.display = 'none';
    }
  }

  private clearDiscountCheckbox(): void {
    const discountCheckbox = document.querySelector('.discount-checkbox');
    if (discountCheckbox instanceof HTMLInputElement) {
      discountCheckbox.checked = false;
    }
  }

  private createSidebar(): HTMLElement {
    const sidebar = document.createElement('aside');
    sidebar.className = 'catalog-sidebar';

    const sidebarHeader = this.createSidebarHeader();
    sidebar.appendChild(sidebarHeader);

    const searchSection = this.createSearchSection();
    sidebar.appendChild(searchSection);

    const sortSection = this.createSortSection();
    sidebar.appendChild(sortSection);

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
    searchInput.addEventListener('input', (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        const value = target.value.trim();

        clearSearchButton.style.display = value ? 'block' : 'none';

        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
          void this.updateSearchFilter(value || undefined);
        }, 300);
      }
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }
        const value = searchInput.value.trim();
        void this.updateSearchFilter(value || undefined);
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

    const allProductsLink = document.createElement('button');
    allProductsLink.type = 'button';
    allProductsLink.className = 'category-link';
    allProductsLink.dataset.categoryId = 'all';

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

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'category-link';
    link.dataset.categoryId = category.id;

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
      if (target && target instanceof HTMLSelectElement) {
        const value = target.value;
        void this.updateAuthorFilter(value || undefined);
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
      filtersText.textContent = ` (Количество фильтров: ${activeFiltersCount})`;
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

    const title = document.createElement('h3');
    title.textContent = 'Товары не найдены';

    const description1 = document.createElement('p');
    description1.textContent = '';

    const description2 = document.createElement('p');
    description2.textContent = 'Выберіте другую категорію';

    const resetButton = document.createElement('button');
    resetButton.className = 'reset-filters-btn';
    resetButton.textContent = 'Сбросить все фильтры';
    resetButton.addEventListener('click', (event) => {
      event.preventDefault();
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
    const productInfo = this.createProductInfoWithHighlight(product);

    card.appendChild(imageContainer);
    card.appendChild(productInfo);

    return card;
  }

  private createProductInfoWithHighlight(product: ProductData): HTMLElement {
    const productInfo = document.createElement('div');
    productInfo.className = 'product-info';

    const title = this.createProductTitleWithHighlight(product);
    const description = this.createProductDescriptionWithHighlight(product);
    const author = this.createProductAuthorWithHighlight(product);
    const category = this.createProductCategoryWithHighlight(product);
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

  private createProductTitleWithHighlight(product: ProductData): HTMLElement {
    const title = document.createElement('h3');
    title.className = 'product-title';

    this.setTextWithHighlight(title, product.name, this.currentFilters.searchText);

    return title;
  }

  private createProductDescriptionWithHighlight(product: ProductData): HTMLElement {
    const description = document.createElement('p');
    description.className = 'product-description';

    const maxLength = 100;
    const text = product.description || 'Описание отсутствует';
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    this.setTextWithHighlight(description, truncatedText, this.currentFilters.searchText);

    return description;
  }

  private createProductAuthorWithHighlight(product: ProductData): HTMLElement {
    const author = document.createElement('p');
    author.className = 'product-author';
    const authorText = product.author ? `Автор: ${product.author}` : 'Автор не указан';

    this.setTextWithHighlight(author, authorText, this.currentFilters.searchText);

    return author;
  }

  private createProductCategoryWithHighlight(product: ProductData): HTMLElement {
    const category = document.createElement('p');
    category.className = 'product-category';
    const categoryText = `Категория: ${product.category || 'Без категории'}`;

    this.setTextWithHighlight(category, categoryText, this.currentFilters.searchText);

    return category;
  }

  private setTextWithHighlight(element: HTMLElement, text: string, searchText?: string): void {
    element.textContent = '';

    if (!searchText || !searchText.trim()) {
      element.textContent = text;
      return;
    }

    const searchTextLower = searchText.trim().toLowerCase();
    const textLower = text.toLowerCase();

    let lastIndex = 0;
    let index = textLower.indexOf(searchTextLower);

    while (index !== -1) {
      if (index > lastIndex) {
        const beforeText = document.createTextNode(text.substring(lastIndex, index));
        element.appendChild(beforeText);
      }

      const highlightSpan = document.createElement('mark');
      highlightSpan.className = 'search-highlight';
      highlightSpan.textContent = text.substring(index, index + searchText.length);
      element.appendChild(highlightSpan);

      lastIndex = index + searchText.length;
      index = textLower.indexOf(searchTextLower, lastIndex);
    }

    if (lastIndex < text.length) {
      const remainingText = document.createTextNode(text.substring(lastIndex));
      element.appendChild(remainingText);
    }
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

    const key = product.key ?? product.id;
    detailsButton.setAttribute('data-key', key);

    detailsButton.addEventListener('click', () => {
      const dataKey = detailsButton.getAttribute('data-key');
      if (dataKey) {
        navigateTo(`/product-about?key=${encodeURIComponent(dataKey)}`);
      }
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

    this.updateActiveCategoryInUI(categoryId);
    this.updateURL();
    await this.applyFilters();
  }

  private updateActiveCategoryInUI(categoryId: string | undefined): void {
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach((link) => {
      link.classList.remove('active');
    });

    if (categoryId === undefined) {
      const allProductsLink = document.querySelector('.category-link[data-category-id="all"]');
      if (allProductsLink) {
        allProductsLink.classList.add('active');
      }
    } else {
      const targetCategoryLink = document.querySelector(`.category-link[data-category-id="${categoryId}"]`);
      if (targetCategoryLink) {
        targetCategoryLink.classList.add('active');
      }
    }
  }

  private async updateSearchFilter(searchText: string | undefined): Promise<void> {
    if (searchText === undefined || searchText === '') {
      delete this.currentFilters.searchText;
      this.clearSearchInput();
    } else {
      this.currentFilters.searchText = searchText;
    }

    this.updateURL();
    await this.applyFilters();
  }

  private async updatePriceFilter(priceRange: { min?: number; max?: number } | undefined): Promise<void> {
    if (priceRange === undefined) {
      delete this.currentFilters.priceRange;
      this.clearPriceInputs();
    } else {
      this.currentFilters.priceRange = priceRange;
    }

    this.updateURL();
    await this.applyFilters();
  }

  private async updateAuthorFilter(author: string | undefined): Promise<void> {
    if (author === undefined || author === '') {
      delete this.currentFilters.author;
      this.clearAuthorSelect();
    } else {
      this.currentFilters.author = author;
    }

    this.updateURL();
    await this.applyFilters();
  }

  private async updateDiscountFilter(hasDiscount: boolean | undefined): Promise<void> {
    if (hasDiscount === undefined || hasDiscount === false) {
      delete this.currentFilters.hasDiscount;
      this.clearDiscountCheckbox();
    } else {
      this.currentFilters.hasDiscount = hasDiscount;
    }

    this.updateURL();
    await this.applyFilters();
  }

  private async applyFilters(): Promise<void> {
    try {
      this.showProductsLoading();

      const products = await ProductService.getProducts(12, this.currentFilters);

      this.products = products;

      this.updateProductsGrid();
      this.updateResultsInfo();
      this.updateActiveFiltersSection();
      this.updateBreadcrumbs();
    } catch (error) {
      console.error('Ошібка фильтров:', error);
      this.showProductsError();
    }
  }

  private showProductsError(): void {
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
      productsGrid.textContent = '';

      const errorDiv = document.createElement('div');
      errorDiv.className = 'products-error';

      const errorIcon = document.createElement('div');
      errorIcon.className = 'error-icon';
      errorIcon.textContent = 'Ошібка';

      const title = document.createElement('h3');
      title.textContent = 'Ошибка загрузки товаров';

      const description = document.createElement('p');
      description.textContent = 'Не удалось загрузить товары. Попробуйте позже.';

      const retryButton = document.createElement('button');
      retryButton.className = 'retry-products-btn';
      retryButton.textContent = 'Попробовать снова';
      retryButton.addEventListener('click', () => {
        location.reload();
      });

      errorDiv.appendChild(errorIcon);
      errorDiv.appendChild(title);
      errorDiv.appendChild(description);
      errorDiv.appendChild(retryButton);

      productsGrid.appendChild(errorDiv);
    }
  }

  private showProductsLoading(): void {
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
      productsGrid.textContent = '';

      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'products-loading';

      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';

      const text = document.createElement('p');
      text.textContent = 'Поиск товаров...';

      loadingDiv.appendChild(spinner);
      loadingDiv.appendChild(text);
      productsGrid.appendChild(loadingDiv);
    }
  }

  private updateProductsGrid(): void {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.textContent = '';

    if (this.products.length === 0) {
      const noProductsMessage = this.createNoProductsMessage();
      productsGrid.appendChild(noProductsMessage);
      return;
    }

    this.products.forEach((product) => {
      const productCard = this.createProductCard(product);
      productsGrid.appendChild(productCard);
    });
  }

  private updateResultsInfo(): void {
    const resultsInfo = document.querySelector('.results-info');
    if (!resultsInfo) return;

    const count = this.products.length;
    const text = count === 1 ? 'товар' : count < 5 ? 'товара' : 'товаров';

    resultsInfo.textContent = '';

    const countText = document.createElement('span');
    countText.className = 'results-count';
    countText.textContent = `Найдено ${count} ${text}`;

    const activeFiltersCount = this.getActiveFiltersCount();
    if (activeFiltersCount > 0) {
      const filtersText = document.createElement('span');
      filtersText.className = 'results-filters';
      filtersText.textContent = ` (количество фильтров: ${activeFiltersCount})`;
      resultsInfo.appendChild(countText);
      resultsInfo.appendChild(filtersText);
    } else {
      resultsInfo.appendChild(countText);
    }
  }

  private updateActiveFiltersSection(): void {
    const activeFiltersSection = document.querySelector('.active-filters-section');
    if (!activeFiltersSection) return;

    const newActiveFiltersSection = this.createActiveFiltersSection();
    activeFiltersSection.replaceWith(newActiveFiltersSection);
  }

  private getActiveFiltersCount(): number {
    let count = 0;

    if (this.currentFilters.categoryId) count++;
    if (this.currentFilters.searchText) count++;
    if (this.currentFilters.priceRange) count++;
    if (this.currentFilters.author) count++;
    if (this.currentFilters.hasDiscount) count++;
    if (this.currentSortOption && this.currentSortOption !== 'default') count++;

    return count;
  }

  private async clearAllFilters(): Promise<void> {
    this.currentFilters = {};
    this.currentSortOption = 'default';

    window.history.pushState({}, '', window.location.pathname);

    try {
      this.showProductsLoading();

      this.products = await ProductService.getProducts(12);

      this.updateProductsGrid();
      this.updateResultsInfo();
      this.updateActiveFiltersSection();
      this.updateSidebarFilters();
      this.updateBreadcrumbs();
    } catch (error) {
      console.error('Ошибка сброса фильтров:', error);
      this.showProductsError();
    }
  }

  private updateSidebarFilters(): void {
    this.updateSearchInputs();
    this.updateSortSelect();
    this.updateActiveCategoryInUI(undefined);
    this.updatePriceInputs();
    this.updateAuthorSelect();
    this.updateDiscountCheckbox();
  }

  private updateSearchInputs(): void {
    const searchInput = document.querySelector('.search-input');
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = '';
    }

    const clearSearchButton = document.querySelector('.clear-search-btn');
    if (clearSearchButton instanceof HTMLButtonElement) {
      clearSearchButton.style.display = 'none';
    }
  }

  private updateSortSelect(): void {
    const sortSelect = document.querySelector('.sort-select');
    if (sortSelect instanceof HTMLSelectElement) {
      sortSelect.value = this.currentSortOption;
    }
  }

  private updatePriceInputs(): void {
    const priceInputs = document.querySelectorAll('.price-input');
    priceInputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.value = '';
      }
    });
  }

  private updateAuthorSelect(): void {
    const authorSelect = document.querySelector('.author-select');
    if (authorSelect instanceof HTMLSelectElement) {
      authorSelect.value = '';
    }

    const resetAuthorButton = document.querySelector('.reset-author-btn');
    if (resetAuthorButton instanceof HTMLButtonElement) {
      resetAuthorButton.style.display = 'none';
    }
  }

  private updateDiscountCheckbox(): void {
    const discountCheckbox = document.querySelector('.discount-checkbox');
    if (discountCheckbox instanceof HTMLInputElement) {
      discountCheckbox.checked = false;
    }
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

  private showErrorMessage(): void {
    this.container.textContent = '';
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
