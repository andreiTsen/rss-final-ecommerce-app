import { AuthService } from '../../services/authService';
import { navigateTo } from '../../main';
import './profile.css';
import createSidebar from './sidebar';
import { renderProfileInfoSection, UserData } from './sectionProfile';
import { renderChangePasswordSection } from './sectionPassword';

export class ProfilePage {
  private container: HTMLElement;
  private user: UserData | null;
  constructor(container: HTMLElement) {
    this.container = container;
    this.user = AuthService.getCurrentUser();
    if (!this.user) {
      navigateTo('/login');
      return;
    }
    this.render();
  }
  private render(): void {
    this.container.innerHTML = '';

    const layout = document.createElement('div');
    layout.classList.add('profile-layout');

    const sidebar = createSidebar((sectionId: string) => {
      if (this.user) {
        this.renderSection(sectionId, this.user);
      }
    });
    const content = document.createElement('div');
    content.classList.add('profile-wrapper');
    content.id = 'profile-content';

    layout.appendChild(sidebar);
    layout.appendChild(content);
    this.container.appendChild(layout);

    this.renderSection('profile', this.user!);
  }

  private renderSection(sectionId: string, user: UserData): void {
    const content = document.getElementById('profile-content');
    if (!content) return;

    content.innerHTML = '';

    if (sectionId === 'profile') {
      const profileSection = renderProfileInfoSection(user);
      content.appendChild(profileSection);
    } else if (sectionId === 'adress') {
      // const title = document.createElement('h2');
      // title.textContent = 'Адрес доставки';
      // const paragraph = document.createElement('p');
      // paragraph.textContent = `Страна: ${user.addresses[0].country || 'не указана'}`;
      // const city = document.createElement('p');
      // city.textContent = `Город: ${user.addresses[0].city || 'не указано'}`;
      // const index = document.createElement('p');
      // index.textContent = `Индекс: ${user.addresses[0].postalCode || 'не указан'}`;
      // const street = document.createElement('p');
      // street.textContent = `Улица: ${user.addresses[0].streetName || 'не указано'}`;
      // content.append(title, paragraph, city, index, street);
    } else if (sectionId === 'password') {
      //  const section = renderChangePasswordSection((oldPass, newPass) => {
      //   });
      // content.append(section);
    } else {
      content.textContent = 'Раздел не найден.';
    }
  }
}
