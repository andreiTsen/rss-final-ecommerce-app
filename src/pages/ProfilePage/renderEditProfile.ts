import { UserData } from './sectionProfile';
import { renderButtonContainer } from './buttonContainer';
import { updateProfileInfo } from './UpateUser';
import { AuthService } from '../../services/authService';

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
    this.form.id = 'edit-profile-form';
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
      const fd = new FormData(this.form);
      const payload: Partial<UserData> = {
        firstName: fd.get('firstName')?.toString(),
        lastName: fd.get('lastName')?.toString(),
        email: fd.get('email')?.toString(),
        dateOfBirth: fd.get('dateOfBirth')?.toString(),
      };
      try {
        const updated = await updateProfileInfo(payload);
        alert('Профиль обновлён!');
        AuthService.updateCurrentUser(updated);
        window.location.reload();
      } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        alert('Ошибка при обновлении. Попробуйте позже.');
      }
    });
  }
  private validateField(name: keyof UserData): boolean {
    const input = this.elements[name]!;
    const errorElement = this.errors[name]!;

    if ((name === 'firstName' || name === 'lastName') && input.value.trim().length < 2) {
      errorElement.textContent = 'Минимум 2 символа';
      return false;
    }
    if (name === 'email' && !input.value.includes('@')) {
      errorElement.textContent = 'Некорректный email';
      return false;
    }
    if (name === 'dateOfBirth' && !input.value) {
      errorElement.textContent = 'Укажите дату рождения';
      return false;
    }
    errorElement.textContent = '';
    return true;
  }
}
