// 📂 src/components/navigation.ts

interface Page {
  name: string;
  path: string;
}

export class Navigation {
  private root: HTMLElement;
  private pages: Page[];

  constructor(root: HTMLElement) {
      this.root = root;
      this.pages = [
          { name: 'Home', path: '/' },
          { name: 'Login', path: '/login' },
          { name: 'Registration', path: '/registration' },
          { name: 'Catalog', path: '/catalog' },
          { name: 'Cart', path: '/cart' },
          { name: 'Profile', path: '/profile' }
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
          link.addEventListener('click', (e) => {
              e.preventDefault();
              const targetPath = (e.target as HTMLAnchorElement).getAttribute('href');
              if (targetPath) {
                  this.navigateTo(targetPath);
              }
          });
      });
  }

  private navigateTo(targetPath: string): void {
      console.log(`Navigating to ${targetPath}`);
      history.pushState(null, '', targetPath);
      this.setActiveLink(targetPath);
      this.renderPage(targetPath);
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

  private renderPage(targetPath: string): void {
      const pageContent = document.getElementById('page-content');
      if (pageContent) {
          const pageName = targetPath === '/' ? 'Home' : targetPath.replace('/', '');
          pageContent.innerHTML = `<h1>${pageName}</h1>`;
      }
  }
}
