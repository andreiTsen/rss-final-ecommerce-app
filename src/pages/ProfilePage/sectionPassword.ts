import { updatePassword } from './UpateUser';
import validatePassword from '../loginPage/validatePassword';
import { renderModal } from './modal';
import { AuthService } from '../../services/authService';

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
    { label: 'Старый пароль', type: 'password', name: 'oldPassword' },
    { label: 'Новый пароль', type: 'password', name: 'newPassword' },
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
  wrapper.appendChild(editButton);
  const V = AuthService.getCurrentUser()?.version || 0;
  editButton.addEventListener('click', async () => {
    const newPwd = inputs['newPassword'].value.trim();
    const oldPwd = inputs['oldPassword'].value.trim();
    if (!newPwd) {
      document.body.appendChild(renderModal('Введите новый пароль'));
      return;
    }
    const { isValid, message } = validatePassword(newPwd);
    if (!isValid) {
      document.body.appendChild(renderModal(message));
      return;
    }
    try {
      const { success } = await updatePassword(V, oldPwd, newPwd);
      if (success) {
        const modalElements = renderModal('Пароль успешно изменён!');
        document.body.appendChild(modalElements);
      } else {
        document.body.appendChild(renderModal('Не удалось сменить пароль. Попробуйте позже.'));
      }
    } catch (error) {
      console.error('Ошибка при смене пароля:', error);
      document.body.appendChild(renderModal('Ошибка при смене пароля. Попробуйте позже.'));
    }
  });
}
