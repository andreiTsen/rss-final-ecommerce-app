import { UserData } from './sectionProfile';
import { EditAddressForm, countries } from './renderEditAdresses';

export function renderAddressSection(user: UserData): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.classList.add('address-section-wrapper');
  const title = document.createElement('h2');
  title.textContent = 'Адрес доставки';
  const address = user.addresses?.[0] || {};

  const paragraph = document.createElement('p');
  if (address.country) {
    const country = countries.find((c) => c.value === address.country);
    paragraph.textContent = `Страна: ${country ? country.text : 'не указана'}`;
  }

  const city = document.createElement('p');
  city.textContent = `Город: ${address.city || 'не указан'}`;
  const index = document.createElement('p');
  index.textContent = `Индекс: ${address.postalCode || 'не указан'}`;
  const street = document.createElement('p');
  street.textContent = `Улица: ${address.streetName || 'не указана'}`;

  const editButton = document.createElement('button');
  editButton.textContent = 'Редактировать адрес';
  editButton.classList.add('edit-address-btn');
  wrapper.append(title, paragraph, city, index, street, editButton);
  editButton.addEventListener('click', () => {
    wrapper.innerHTML = '';
    const editAddress = new EditAddressForm(address);
    wrapper.appendChild(editAddress.element);
  });

  return wrapper;
}
