import './modal.css';
import { AuthService } from '../../services/authService';
import { renderProfileInfoSection } from './sectionProfile';
import { renderAddressSection } from './sectionAdresses';

export function renderModal(message: string, category?: string): HTMLElement {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  const modalTitle = document.createElement('h2');
  modalTitle.textContent = 'Уведомление';

  const content = document.getElementById('profile-content');
  const modalText = document.createElement('p');
  modalText.classList.add('modal-message');
  modalText.textContent = message;

  const user = AuthService.getCurrentUser();
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Закрыть';
  closeButton.classList.add('close-button');
  closeButton.addEventListener('click', () => {
    modal.remove();
    console.log(`Modal closed with category: ${category}`);
    console.log(`pofile content`, content);
    if (category === 'profile') {
      content!.innerHTML = '';
      const profileSection = renderProfileInfoSection(user!);
      content?.appendChild(profileSection);
    }
    if (category === 'address') {
      content!.innerHTML = '';
      const addressSection = renderAddressSection(user!);
      content?.appendChild(addressSection);
    }
  });

  modalContent.append(modalTitle, modalText, closeButton);
  modal.appendChild(modalContent);
  return modal;
}
