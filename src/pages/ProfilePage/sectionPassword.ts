import { UserData } from './sectionProfile';
import { updatePassword } from './UpateUser';

export function renderChangePassword(): HTMLElement {
  return createPasswordChangeForm();
}

function createPasswordChangeForm(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.classList.add('password-section-wrapper');

  const title = document.createElement('h2');
  title.textContent = 'Изменить пароль';
  wrapper.appendChild(title);

  const inputs = createPasswordInputs(wrapper);

  createChangePasswordButton(wrapper, inputs);

  return wrapper;
}

function createPasswordInputs(wrapper: HTMLElement): { [key: string]: HTMLInputElement } {
  const list = [
    { label: 'Текущий пароль', type: 'password', name: 'currentPassword' },
    { label: 'Новый пароль', type: 'password', name: 'newPassword' },
    { label: 'Подтвердите новый пароль', type: 'password', name: 'confirmNewPassword' },
  ];
  const inputs: { [key: string]: HTMLInputElement } = {};

  list.forEach((item) => {
    const label = document.createElement('label');
    label.textContent = item.label;
    const input = document.createElement('input');
    input.type = item.type;
    input.name = item.name;
    input.classList.add('input-field');
    inputs[item.name] = input;
    wrapper.appendChild(label);
    wrapper.appendChild(input);
  });

  return inputs;
}

function createChangePasswordButton(wrapper: HTMLElement, inputs: { [key: string]: HTMLInputElement }): void {
  const editButton = document.createElement('button');
  editButton.textContent = 'Сменить пароль';
  editButton.classList.add('edit-address-btn');
  wrapper.append(editButton);

  editButton.addEventListener('click', () => handlePasswordChange(inputs, wrapper));
}

function handlePasswordChange(inputs: { [key: string]: HTMLInputElement }, wrapper: HTMLElement): void {
  const currentPassword = inputs['currentPassword'].value;
  const newPassword = inputs['newPassword'].value;
  const confirmNewPassword = inputs['confirmNewPassword'].value;
  if (currentPassword === newPassword) {
    alert('Новый пароль не должен совпадать со старым');
    return;
  }
  if (newPassword.length < 8) {
    alert('Новый пароль должен быть не менее 8 символов');
    return;
  }
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
    alert(
      'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ'
    );
    return;
  }

  if (newPassword !== confirmNewPassword) {
    alert('Пароли не совпадают');
    return;
  }

  sendPasswordChangeToServer(currentPassword, newPassword)
    .then(() => {
      alert('Изменение пароля прошло успешно');
      wrapper.innerHTML = '';
    })
    .catch((error) => {
      alert('Ошибка при изменении пароля: ' + error.message);
    });
}

function sendPasswordChangeToServer(currentPassword: string, newPassword: string): Promise<void> {
  console.log('Изменение пароля на сервере:', currentPassword, newPassword);
  return Promise.resolve();
}
