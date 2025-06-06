import { UserData } from './sectionProfile';
import { renderButtonContainer } from './buttonContainer';
import { updateProfileInfo } from './UpateUser';
import { renderModal } from './modal';
import { AuthService } from '../../services/authService';
import { renderProfileInfoSection } from './sectionProfile';

const fields: { name: keyof UserData; label: string; type?: string }[] = [
  { name: 'firstName', label: 'Имя', type: 'text' },
  { name: 'lastName', label: 'Фамилия', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'dateOfBirth', label: 'Дата рождения', type: 'date' },
];

export class EditProfileForm {
  private form = document.createElement('form');
  private elements: { [K in keyof UserData]?: HTMLInputElement } = {};
  private errors: { [K in keyof UserData]?: HTMLElement } = {};
  private user: UserData;

  constructor(user: UserData) {
    this.user = user;
    this.form.id = 'edit-profile-form profile';
    this.form.classList.add('edit-profile-form');
    this.render();
  }

  public get element(): HTMLFormElement {
    return this.form;
  }

  private render(): void {
    this.renderTitle();
    this.renderFields();
    this.setupFormSubmit();
  }

  private renderTitle(): void {
    const title = document.createElement('h2');
    title.textContent = 'Редактировать профиль';
    this.form.append(title);
  }

  private renderFields(): void {
    fields.forEach(({ name, label, type }) => {
      const wrapper = document.createElement('div');
      const lbl = document.createElement('label');
      lbl.textContent = label;
      const input = document.createElement('input');
      input.type = type ?? 'text';
      input.name = name;
      input.placeholder = label;
      input.value = String(this.user[name] ?? '');
      const error = document.createElement('span');
      error.className = 'field-error';
      wrapper.append(lbl, input, error);
      this.elements[name] = input;
      this.errors[name] = error;
      this.form.append(wrapper);
      input.addEventListener('input', () => this.validateField(name));
    });
    this.form.append(renderButtonContainer());
  }

  private setupFormSubmit(): void {
    this.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      let isValid = true;

      for (const field of fields) {
        if (!this.validateField(field.name)) {
          isValid = false;
        }
      }
      if (!isValid) {
        return;
      }
      const fd = new FormData(this.form);
      const payload: Partial<UserData> = {
        firstName: fd.get('firstName')?.toString(),
        lastName: fd.get('lastName')?.toString(),
        email: fd.get('email')?.toString(),
        dateOfBirth: fd.get('dateOfBirth')?.toString(),
      };
      try {
        const updated = await updateProfileInfo(payload);
        const modal = renderModal('Профиль обновлен успешно', 'profile');
        document.body.appendChild(modal);
        AuthService.updateCurrentUser(updated);
        renderProfileInfoSection(updated);
      } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        const modal = renderModal('Ошибка при обновлении. Попробуйте позже.');
        document.body.appendChild(modal);
      }
    });
  }
  private validateField(name: keyof UserData): boolean {
    const input = this.elements[name]!;
    const errorElement = this.errors[name]!;

    if ((name === 'firstName' || name === 'lastName') && input.value.length < 2) {
      errorElement.textContent = 'Минимум 2 символа';
      return false;
    }
    if ((name === 'firstName' || name === 'lastName') && !/^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(input.value)) {
      errorElement.textContent = 'Только буквы';
      return false;
    }
    if (name === 'email' && !input.value.includes('@')) {
      errorElement.textContent = 'Некорректный email';
      return false;
    }

    if (name === 'dateOfBirth') {
      if (!input.value) {
        errorElement.textContent = 'Укажите дату рождения';
        return false;
      }
      const birthDate = new Date(input.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        // birthday not reached yet this year
        age--;
      }
      if (age < 16 || age > 100) {
        errorElement.textContent = 'Возраст должен быть от 16 до 100 лет';
        return false;
      }
    }
    errorElement.textContent = '';
    return true;
  }
}
