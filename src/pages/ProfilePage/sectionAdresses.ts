import { UserData } from './sectionProfile';
import { EditAddressForm, countries } from './renderEditAdresses';
import { AuthService } from '../../services/authService';
import { updateDefaultShippingAddress } from './UpateUser';
import { AddAddressForm } from './addAddress';
import { ShipmentStateValues } from '@commercetools/platform-sdk';


  function createParagraph(label: string, value?: string): HTMLParagraphElement {
    const p = document.createElement('p');
    p.textContent = `${label}: ${value || 'не указан'}`;
    return p;
  }

  function createCountryParagraph(countryCode?: string): HTMLParagraphElement {
    const p = document.createElement('p');
    if (countryCode) {
      const country = countries.find((c) => c.value === countryCode);
      p.textContent = `Страна: ${country ? country.text : 'не указана'}`;
    } else {
      p.textContent = 'Страна: не указана';
    }
    return p;
  }

  function createShippingParagraph(addressId?: string): HTMLParagraphElement {
    const p = document.createElement('p');
    p.textContent = 'Адрес для доставки';
    const shippingCheckbox = document.createElement('input');
    shippingCheckbox.classList.add('shipping-checkbox');
    shippingCheckbox.type = 'checkbox';
    const idShippingAddressId = AuthService.getCurrentUser()?.defaultShippingAddressId || '';
    shippingCheckbox.checked = addressId === idShippingAddressId;
    p.appendChild(shippingCheckbox);
    return p;
  }

  function createAddressParagraph(address: {
    id?: string
    country?: string
    city?: string
    postalCode?: string
    streetName?: string
  }): HTMLElement[] {
    const paragraphs: HTMLElement[] = [];
    paragraphs.push(createCountryParagraph(address.country));
    paragraphs.push(createParagraph('Город', address.city));
    paragraphs.push(createParagraph('Индекс', address.postalCode));
    paragraphs.push(createParagraph('Улица', address.streetName));
    paragraphs.push(createShippingParagraph(address.id));
    return paragraphs;
  }

  export function createAddressWrapper(address: {
    id?: string
    country?: string
    city?: string
    postalCode?: string
    streetName?: string
  }): HTMLElement {
    const addressWrapper = document.createElement('div');
    addressWrapper.classList.add('single-address');

    const paragraphs = createAddressParagraph(address);
    paragraphs.forEach(p => addressWrapper.appendChild(p));

    appendEditButton(addressWrapper, address);
    setupShippingCheckboxListener(addressWrapper, address);

    return addressWrapper;
  }

  function appendEditButton(addressWrapper: HTMLElement, address: {
    id?: string
    country?: string
    city?: string
    postalCode?: string
    streetName?: string
  }): void {
    const editButton = document.createElement('button');
    editButton.textContent = 'Редактировать адрес';
    editButton.classList.add('edit-address-btn');
    editButton.addEventListener('click', () => {
      const sectionA = document.querySelector('.address-section-wrapper');
      if (sectionA) {
        sectionA.innerHTML = '';
        const editAddress = new EditAddressForm(address);
        sectionA.appendChild(editAddress.element);
      }
    });
    addressWrapper.appendChild(editButton);
  }

  function setupShippingCheckboxListener(addressWrapper: HTMLElement, address: {
    id?: string
    country?: string
    city?: string
    postalCode?: string
    streetName?: string
  }): void {
    const ShipmentStateValues = AuthService.getCurrentUser();
    const idShippingAddressId = ShipmentStateValues?.defaultShippingAddressId || '';
    const shippingCheckbox = addressWrapper.querySelector('.shipping-checkbox');
    if (shippingCheckbox instanceof HTMLInputElement) {
      shippingCheckbox.addEventListener('change', () => {
        if (shippingCheckbox.checked) {
          const allCheckboxes = document.querySelectorAll('.shipping-checkbox');
          void updateDefaultShippingAddress(address.id || '');
          allCheckboxes.forEach((checkbox) => {
            if (checkbox !== shippingCheckbox && checkbox instanceof HTMLInputElement) {
              checkbox.checked = false;
            }
          });
        }
      });
    }
  }

  export function renderAddressSection(user: UserData): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('address-section-wrapper');
    const title = document.createElement('h2');
    title.textContent = 'Адрес доставки';
    const addButton = document.createElement('button');
    addButton.textContent = 'Добавить адрес';
    addButton.classList.add('add-address-btn');
    addButton.addEventListener('click', () => {
      const sectionA = document.querySelector('.address-section-wrapper');
      if (sectionA) {
        sectionA.innerHTML = '';
        const addAddress = new AddAddressForm({
          id: undefined,
          country: undefined,
          city: undefined,
          postalCode: undefined,
          streetName: undefined
        });
        sectionA.appendChild(addAddress.element);
      }
    });
    wrapper.appendChild(title);
    const addressesBlock = document.createElement('div');
    addressesBlock.classList.add('addresses-block');
    if (user.addresses && user.addresses.length > 0) {
      user.addresses.forEach(address => {
        const addressWrapper = createAddressWrapper(address);
        addressesBlock.appendChild(addressWrapper);
      });
    } else {
      const noAddress = document.createElement('p');
      noAddress.textContent = 'Адреса не указаны';
      addressesBlock.appendChild(noAddress);
    }
    wrapper.appendChild(addressesBlock);
    wrapper.appendChild(addButton);

    return wrapper;
  }