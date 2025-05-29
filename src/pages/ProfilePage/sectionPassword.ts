export function renderChangePasswordSection(onChange: (oldPass: string, newPass: string) => void): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.classList.add('change-password-section');

  const title = document.createElement('h2');
  title.textContent = 'Смена пароля';

  const form = document.createElement('form');

  const oldPassLabel = document.createElement('label');
  oldPassLabel.textContent = 'Старый пароль: ';
  const oldPassInput = document.createElement('input');
  oldPassInput.type = 'password';
  oldPassInput.required = true;

  const newPassLabel = document.createElement('label');
  newPassLabel.textContent = 'Новый пароль: ';
  const newPassInput = document.createElement('input');
  newPassInput.type = 'password';
  newPassInput.required = true;

  // Кнопка
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Изменить пароль';

  // Сообщение
  const message = document.createElement('div');
  message.classList.add('change-password-msg');

  // Обработка формы
  form.onsubmit = (e) => {
    e.preventDefault();
    // Тут можно добавить валидацию
    if (oldPassInput.value && newPassInput.value) {
      onChange(oldPassInput.value, newPassInput.value);
    }
  };

  // Сборка
  form.append(oldPassLabel, oldPassInput, document.createElement('br'));
  form.append(newPassLabel, newPassInput, document.createElement('br'));
  form.append(button);
  wrapper.append(title, form, message);

  return wrapper;
}
