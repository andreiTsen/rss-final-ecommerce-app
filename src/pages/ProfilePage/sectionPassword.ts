import { UserData } from './sectionProfile';


export function renderChangePassword(user: UserData): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.classList.add('password-section-wrapper');
   console.log(user);
  const title = document.createElement('h2');
  title.textContent = 'Изменить пароль';
  wrapper.appendChild(title);
  const list =[
    { label: 'Текущий пароль', type: 'password', name: 'currentPassword' },
    { label: 'Новый пароль', type: 'password', name: 'newPassword' },
    { label: 'Подтвердите новый пароль', type: 'password', name: 'confirmNewPassword' }
  ]
  list.forEach(item => {
    const label = document.createElement('label');
    label.textContent = item.label;
    const input = document.createElement('input');
    input.type = item.type;
    input.name = item.name;
    input.classList.add('input-field');
    wrapper.appendChild(label);
    wrapper.appendChild(input);
  });
  
  const editButton = document.createElement('button');
  editButton.textContent = 'Сменить пароль';
  editButton.classList.add('edit-address-btn');
  wrapper.append( editButton);
  editButton.addEventListener('click', () => {
    wrapper.innerHTML = '';
  });


  return wrapper;
}
