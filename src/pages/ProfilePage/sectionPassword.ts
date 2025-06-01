import { UserData } from './sectionProfile';



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
    { label: 'Подтвердите новый пароль', type: 'password', name: 'confirmNewPassword' }
  ];
  const inputs: { [key: string]: HTMLInputElement } = {};
  
  list.forEach(item => {
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
  if (newPassword.length < 6) {
    alert('Новый пароль должен быть не менее 6 символов');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    alert('Пароли не совпадают');
    return;
  }

  wrapper.innerHTML = '';
}