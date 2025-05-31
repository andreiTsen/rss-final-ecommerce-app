import { AuthService } from '../../services/authService';
import { navigateTo } from '../../main';
import './profile.css';
import createSidebar from './sidebar';
import { renderProfileInfoSection, UserData } from './sectionProfile';
import { renderAddressSection } from './sectionAdresses';
import { renderChangePassword } from './sectionPassword';

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
      const addressSection = renderAddressSection(user);
      content.appendChild(addressSection);
    } else if (sectionId === 'password') {
      const section = renderChangePassword(user);
      content.append(section);
    } else {
      content.textContent = 'Раздел не найден.';
    }
  }
}
