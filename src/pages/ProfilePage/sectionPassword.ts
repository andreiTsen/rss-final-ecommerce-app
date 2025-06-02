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

  editButton.addEventListener('click', async () => {
    const oldPwd = inputs['currentPassword'].value;
    const newPwd = inputs['newPassword'].value;
    const confirm = inputs['confirmNewPassword'].value;

    if (oldPwd === newPwd) {
      return alert('Новый пароль не должен совпадать со старым');
    }
    if (newPwd.length < 6) {
      return alert('Новый пароль должен быть не менее 6 символов');
    }
    if (newPwd !== confirm) {
      return alert('Пароли не совпадают');
    }

    try {
      await updatePassword(oldPwd, newPwd);
      alert('Пароль успешно изменён!');
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 400) {
        return alert('Текущий пароль введён неверно');
      }
      console.error(error);
      alert('Ошибка при смене пароля. Попробуйте позже.');
    }
  });
}
