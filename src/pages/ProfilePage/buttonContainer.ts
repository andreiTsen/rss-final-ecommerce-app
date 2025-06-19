import { AuthorizationService } from '../../services/authentication';
import { renderAddressSection } from './sectionAdresses';
import { renderProfileInfoSection, UserData } from './sectionProfile';

function clearAndRenderContent(content: HTMLElement, renderSection: (user: UserData) => HTMLElement): void {
  content.innerHTML = '';
  const user = AuthorizationService.getCurrentUser();
  if (user) {
    const profileSection = renderSection(user);
    content.appendChild(profileSection);
  }
}

export function renderButtonContainer(): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('button-container');
  container.id = 'button-container';
  const saveButton = document.createElement('button');
  saveButton.classList.add('save-button');
  saveButton.type = 'submit';
  saveButton.textContent = 'Сохранить';
  const cancelButton = document.createElement('button');
  cancelButton.classList.add('cancel-button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Отмена';
  container.append(saveButton, cancelButton);
  saveButton.addEventListener('click', () => {
    const form = document.querySelector('form');
    if (form) {
    }
  });
  cancelButton.addEventListener('click', () => {
    const content = document.getElementById('profile-content');
    const section = document.getElementById('address');
    if (content) {
      if (section) {
        clearAndRenderContent(content, renderAddressSection);
      } else {
        clearAndRenderContent(content, renderProfileInfoSection);
      }
    }
  });
  return container;
}
