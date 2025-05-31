import { UserData } from './sectionProfile';
import { renderButtonContainer } from './buttonContainer';

const fields: { name: keyof UserData; label: string; type?: string }[] = [
      { name: 'firstName', label: 'Имя', type: 'text' },
      { name: 'lastName', label: 'Фамилия', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'dateOfBirth', label: 'Дата рождения', type: 'date' },
    ];
export class EditProfileForm {
  private form: HTMLFormElement;
  private elements: { [K in keyof UserData]?: HTMLInputElement } = {};
  private errors: { [K in keyof UserData]?: HTMLElement } = {};
  private user: UserData;

  constructor(user: UserData) {
    this.user = user;
    this.form = document.createElement('form');
    this.form.id = 'edit-profile-form';
    this.form.classList.add('edit-profile-form');
    this.render();
  }

  public get element() : HTMLFormElement {
    return this.form;
  }

  private render(): void {
    const title = document.createElement('h2');
    title.textContent = 'Редактировать профиль';
    
    this.form.appendChild(title);
    fields.forEach(({ name, label, type }) => {
      const fieldWrapper = document.createElement('div');
      const fieldLabel = document.createElement('label');
      fieldLabel.textContent = label;
      const input = document.createElement('input');
      input.type = type || 'text';
      input.name = name;
      input.placeholder = label;
      input.value = typeof this.user[name] === 'string' ? this.user[name] satisfies string : '';
      const error = document.createElement('span');
      error.className = 'field-error';
      error.id = `${name}-error`;
      this.elements[name] = input;
      this.errors[name] = error;
      fieldWrapper.append(fieldLabel, input, error);
      this.form.appendChild(fieldWrapper);
      input.addEventListener('input', () => this.validateField(name));
    });
    const submitButton = renderButtonContainer();
    this.form.appendChild(submitButton);
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(this.form);
      const formDataObject = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        dateOfBirth: formData.get('dateOfBirth'),
      } 
      console.log(formDataObject);
    });    
  }

  private validateField(name: keyof UserData): boolean {
    const input = this.elements[name];
    const error = this.errors[name];
    if (!input || !error) return true;

    if (name === 'firstName' || name === 'lastName') {
      if (!input.value.trim()) {
        error.textContent = 'Поле обязательно';
        return false;
      } else if (input.value.length < 2) {
        error.textContent = 'Минимум 2 символа';
        return false;
      }
    }
    if (name === 'email') {
      if (!input.value.includes('@')) {
        error.textContent = 'Некорректный email';
        return false;
      }
    }
    if (name === 'dateOfBirth') {
      if (!input.value) {
        error.textContent = 'Укажите дату рождения';
        return false;
      }
    }
    error.textContent = '';
    return true;
  }

 
}
