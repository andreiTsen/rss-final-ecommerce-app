import type { Address } from './sectionProfile';
import { renderButtonContainer } from './buttonContainer';
import { updateAddress, addAddress } from './UpateUser';
import { renderModal } from './modal';
import { renderAddressSection } from './sectionAdresses';
import { AuthService } from '../../services/authService';
import { version } from 'process';

export const countries = [
  { value: '', text: 'Выберите страну' },
  { value: 'US', text: 'США' },
  { value: 'CA', text: 'Канада' },
  { value: 'UK', text: 'Великобритания' },
  { value: 'DE', text: 'Германия' },
  { value: 'FR', text: 'Франция' },
  { value: 'BY', text: 'Беларусь' },
  { value: 'UA', text: 'Украина' },
];

export class AddAddressForm {
  private form: HTMLFormElement;
  private inputs: Partial<Record<keyof Address, HTMLInputElement>> = {};

  constructor(private address: Address) {
    this.form = this.render(address);
  }

  public get element(): HTMLFormElement {
    if (!this.form) {
      throw new Error('Форма не была инициализирована');
    }
    this.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(this.form);
      const id = formData.get('id');
      const country = formData.get('country');
      const city = formData.get('city');
      const postalCode = formData.get('postalCode');
      const streetName = formData.get('streetName');
      if (!(country && city && postalCode && streetName)) {
        throw new Error('Missing required form data');
      }
      const validate = this.validatePostalCode(postalCode.toString());
      if (!validate || !this.validateCity(city.toString()) || !this.validateStreetName(streetName.toString())) {
        document.body.appendChild(renderModal('Некорректные данные. Пожалуйста, проверьте введенные данные. Почтовый код должен состоять из 5 цифр.'));
        return;
      }
      const formDataObject = {
        id: id ? id.toString() : undefined,
        country: country.toString(),
        city: city.toString(),
        street: streetName.toString(),
        postalCode: postalCode.toString(),
      };
      try {
        const add = await addAddress(formDataObject);
        const modal = renderModal('Адрес добавлен!', 'address');
        document.body.appendChild(modal);
        renderAddressSection(add);
      } catch (error) {
        console.error('Ошибка при сохранении адреса:', error);
        renderModal('Ошибка при сохранении адреса. Попробуйте позже.');
      }
    });
    return this.form;
  }
  private render(address: Address): HTMLFormElement {
    const form = document.createElement('form');
    form.classList.add('edit-address-form');
    form.id = 'address';

    this.appendTitle(form);
    this.appendIdInput(form, address);
    this.appendFields(form, address);

    const conteinersButton = renderButtonContainer();
    form.appendChild(conteinersButton);

    return form;
  }
  private validatePostalCode(postalCode: string): boolean {
    const postalCodePattern = /^[0-9]{5}?$/;
    return postalCodePattern.test(postalCode);
  }
  private validateCity(city: string): boolean {
    const cityPattern = /^[a-zA-Zа-яА-Я\s]+$/;
    return cityPattern.test(city);
  }
  private validateStreetName(streetName: string): boolean {
    const streetNamePattern = /^[a-zA-Zа-яА-Я0-9\s]+$/;
    return streetNamePattern.test(streetName);
  }
  private appendTitle(form: HTMLFormElement): void {
    const title = document.createElement('h2');
    title.textContent = 'Добавить адрес';
    form.appendChild(title);
  }
  private appendAddButton(form: HTMLFormElement): void {
    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.textContent = 'Добавить адрес';
    addButton.classList.add('btn', 'btn-primary');
    form.appendChild(addButton);
  }
  private appendIdInput(form: HTMLFormElement, address: Address): void {
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.name = 'id';
    idInput.value = address.id ?? '';
    form.append(idInput);
  }

  private appendFields(form: HTMLFormElement, address: Address): void {
    const fields: Array<{ label: string; name: keyof Address }> = [
      { label: 'Страна', name: 'country' },
      { label: 'Город', name: 'city' },
      { label: 'Индекс', name: 'postalCode' },
      { label: 'Улица', name: 'streetName' },
    ];

    fields.forEach(({ label, name }) => {
      const labelElement = document.createElement('label');
      labelElement.textContent = label;
      labelElement.htmlFor = name;

      if (name === 'country') {
        const country = countries.find((c) => c.value === address[name]);
        const countrySelect = country?.value || '';
        form.appendChild(labelElement);
        form.appendChild(this.countrySelect(countrySelect));
      } else {
        const input = document.createElement('input');
        input.name = name;
        input.id = name;
        input.type = 'text';
        input.value = address[name] ?? '';
        input.required = true;
        form.appendChild(labelElement);
        form.appendChild(input);
        this.inputs[name] = input;
      }
      form.appendChild(document.createElement('br'));
    });
  }
  private countrySelect(name: string): HTMLSelectElement {
    const select = document.createElement('select');
    select.name = 'country';
    select.id = 'country';

    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country.value;
      option.textContent = country.text;
      if (country.value === name) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    return select;
  }
}
