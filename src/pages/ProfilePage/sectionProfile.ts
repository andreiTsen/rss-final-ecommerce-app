import avatarFallback from '../../assets/raccoon.png';
import { EditProfileForm } from '../ProfilePage/renderEditProfile';

export type Address = {
  id?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  streetName?: string;
};

export type UserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: string;
  addresses?: Address[];
  shippingAddress?: string;
};

export function renderProfileInfoSection(user: UserData): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.id = 'profile';
  wrapper.classList.add('profile-info-section');

  const title = document.createElement('h2');
  title.textContent = 'Личная информация';

  const name = document.createElement('p');
  name.textContent = `Имя: ${user.firstName || 'не указано'}`;

  const lastName = document.createElement('p');
  lastName.textContent = `Фамилия: ${user.lastName || 'не указано'}`;

  const email = document.createElement('p');
  email.textContent = `Email: ${user.email}`;

  const birthDate = document.createElement('p');
  birthDate.textContent = `Дата рождения: ${user.dateOfBirth || 'не указана'}`;

  const editButton = document.createElement('button');
  editButton.classList.add('edit-profile-button');
  editButton.textContent = 'Редактировать';

  wrapper.append(title, name, lastName, email, birthDate, editButton);

  editButton.addEventListener('click', () => {
    wrapper.innerHTML = '';
    const editForm = new EditProfileForm(user);
    wrapper.appendChild(editForm.element);
  });
  return wrapper;
}
