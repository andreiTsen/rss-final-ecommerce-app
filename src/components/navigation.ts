type Page = {
  name: string;
  path: string;
};

export class Navigation {
  private root: HTMLElement;
  private pages: Page[];

  constructor(root: HTMLElement) {
    this.root = root;
    this.pages = [
      { name: 'Home', path: '/' },
      { name: 'Catalog', path: '/catalog' },
      { name: 'Cart', path: '/cart' },
      { name: 'Profile', path: '/profile' },
      { name: 'Login', path: '/login' },
      { name: 'Registration', path: '/registration' },
    ];
    this.render();
    this.addEventListeners();
  }

  private render(): void {
    const nav = document.createElement('nav');
    nav.classList.add('navbar');

    this.pages.forEach((page) => {
      const link = document.createElement('a');
      link.href = page.path;
      link.textContent = page.name;
      link.classList.add('nav-link');
      nav.appendChild(link);
    });

    this.root.appendChild(nav);
  }

  private addEventListeners(): void {
    const links = this.root.querySelectorAll('.nav-link');
    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const target = event.target;
        if (target instanceof HTMLAnchorElement) {
          const targetPath = target.getAttribute('href');
          if (targetPath) {
            this.navigateTo(targetPath);
          }
        }
      });
    });
  }

  private navigateTo(targetPath: string): void {
    history.pushState(null, '', targetPath);
    this.setActiveLink(targetPath);
    renderPage(targetPath);
  }

  private setActiveLink(targetPath: string): void {
    const links = this.root.querySelectorAll('.nav-link');
    links.forEach((link) => {
      if (link.getAttribute('href') === targetPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

function renderPage(targetPath: string): void {
  const pageContent = document.getElementById('page-content');
  if (pageContent) {
    const pageName = targetPath === '/' ? 'Home' : targetPath.replace('/', '');
    pageContent.innerHTML = `<h1>${pageName}</h1>`;
  }
}
