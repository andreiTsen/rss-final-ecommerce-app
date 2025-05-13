import loginPage from './pages/loginPage/loginPage';
import '././assets/style.css';

export class App {
  private container;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'app';
    document.body.append(this.container);
    new loginPage(this.container);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
