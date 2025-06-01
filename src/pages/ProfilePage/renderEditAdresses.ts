import type { Address } from './sectionProfile';
import { renderButtonContainer } from './buttonContainer';

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

export class EditAddressForm {
  private form: HTMLFormElement;
  private inputs: Partial<Record<keyof Address, HTMLInputElement>> = {};

  constructor(address: Address) {
    this.form = this.render(address);
  }

  public get element(): HTMLFormElement {
    if (!this.form) {
      throw new Error('Форма не была инициализирована');
    }
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(this.form);
      const formDataObject = {
        country: formData.get('country'),
        city: formData.get('city'),
        postalCode: formData.get('postalCode'),
        streetName: formData.get('streetName'),
      };
      console.log(formDataObject);
    });
    return this.form;
  }
  private render(address: Address): HTMLFormElement {
    const form = document.createElement('form');
    form.classList.add('edit-address-form');
    const title = document.createElement('h2');
    title.textContent = 'Редактировать адрес';
    form.appendChild(title);
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
    const conteinersButton = renderButtonContainer();
    form.appendChild(conteinersButton);

    return form;
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
