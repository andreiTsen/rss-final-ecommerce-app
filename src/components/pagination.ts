export type PaginationState = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export class Pagination {
  private container: HTMLElement;
  private state: PaginationState;
  private onPageChange: (page: number) => void;

  constructor(container: HTMLElement, state: PaginationState, onPageChange: (page: number) => void) {
    this.container = container;
    this.state = state;
    this.onPageChange = onPageChange;
    this.render();
  }

  public static createLoadingIndicator(container: HTMLElement): void {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'pagination-loading';

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';

    const text = document.createElement('span');
    text.textContent = 'Загрузка товаров...';

    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(text);

    container.appendChild(loadingDiv);
  }

  public static removeLoadingIndicator(container: HTMLElement): void {
    const loadingDiv = container.querySelector('.pagination-loading');
    if (loadingDiv) {
      container.removeChild(loadingDiv);
    }
  }

  public static getPageFromURL(): number {
    const urlParameters = new URLSearchParams(window.location.search);
    const pageParameter = urlParameters.get('page');
    return pageParameter ? Math.max(1, parseInt(pageParameter, 10)) : 1;
  }

  public static updateURLWithPage(page: number): void {
    const url = new URL(window.location.href);
    const parameters = new URLSearchParams(url.search);

    if (page > 1) {
      parameters.set('page', page.toString());
    } else {
      parameters.delete('page');
    }

    const newURL = parameters.toString() ? `${url.pathname}?${parameters.toString()}` : url.pathname;
    window.history.pushState({ page }, '', newURL);
  }

  public updateState(newState: PaginationState): void {
    this.state = newState;
    this.render();
  }

  public destroy(): void {
    this.clearContainer();
  }

  private render(): void {
    this.clearContainer();

    if (this.state.totalPages <= 1) {
      return;
    }

    const paginationContainer = this.createPaginationContainer();
    this.container.appendChild(paginationContainer);
  }

  private clearContainer(): void {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }

  private createPaginationContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'pagination-container';

    const info = this.createPaginationInfo();
    const navigation = this.createPaginationNavigation();

    container.appendChild(info);
    container.appendChild(navigation);

    return container;
  }

  private createPaginationInfo(): HTMLElement {
    const info = document.createElement('div');
    info.className = 'pagination-info';

    const currentInfo = document.createElement('div');
    currentInfo.className = 'pagination-current-info';

    const start = (this.state.currentPage - 1) * this.state.itemsPerPage + 1;
    const end = Math.min(this.state.currentPage * this.state.itemsPerPage, this.state.totalItems);

    currentInfo.textContent = `Показано ${start}-${end} из ${this.state.totalItems} товаров`;

    const pageInfo = document.createElement('div');
    pageInfo.className = 'pagination-page-info';
    pageInfo.textContent = `Страніца ${this.state.currentPage} из ${this.state.totalPages}`;

    info.appendChild(currentInfo);
    info.appendChild(pageInfo);

    return info;
  }

  private createPaginationNavigation(): HTMLElement {
    const navigation = document.createElement('div');
    navigation.className = 'pagination-navigation';

    const buttonsContainer = this.createButtonsContainer();
    navigation.appendChild(buttonsContainer);

    return navigation;
  }

  private createButtonsContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'pagination-buttons';

    this.addNavigationButtons(container);
    this.addPageNumbers(container);
    this.addNavigationButtons(container, false);

    return container;
  }

  private addPageNumbers(container: HTMLElement): void {
    const pageNumbers = this.getPageNumbers();
    pageNumbers.forEach((pageNumber) => {
      if (pageNumber === '...') {
        const ellipsis = this.createEllipsis();
        container.appendChild(ellipsis);
      } else if (typeof pageNumber === 'number') {
        const pageButton = this.createPageButton(
          pageNumber.toString(),
          pageNumber,
          `Страница ${pageNumber}`,
          pageNumber === this.state.currentPage
        );
        container.appendChild(pageButton);
      }
    });
  }

  private addNavigationButtons(container: HTMLElement, isStart: boolean = true): void {
    if (isStart) {
      if (this.state.currentPage > 1) {
        const firstButton = this.createPageButton('«', 1, 'Первая страница');
        container.appendChild(firstButton);
      }

      if (this.state.hasPrev) {
        const previousButton = this.createPageButton('‹', this.state.currentPage - 1, 'Предыдущая страница');
        container.appendChild(previousButton);
      }
    } else {
      if (this.state.hasNext) {
        const nextButton = this.createPageButton('›', this.state.currentPage + 1, 'Следующая страница');
        container.appendChild(nextButton);
      }

      if (this.state.currentPage < this.state.totalPages) {
        const lastButton = this.createPageButton('»', this.state.totalPages, 'Последняя страница');
        container.appendChild(lastButton);
      }
    }
  }

  private createPageButton(text: string, page: number, title: string, isActive: boolean = false): HTMLElement {
    const button = document.createElement('button');
    button.className = 'pagination-button';
    button.textContent = text;
    button.title = title;
    button.type = 'button';

    if (isActive) {
      button.classList.add('active');
      button.disabled = true;
    }

    if (!isActive) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        this.onPageChange(page);
      });
    }

    return button;
  }

  private createEllipsis(): HTMLElement {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination-ellipsis';
    ellipsis.textContent = '...';
    return ellipsis;
  }

  private getPageNumbers(): (number | string)[] {
    const current = this.state.currentPage;
    const total = this.state.totalPages;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  }
}
