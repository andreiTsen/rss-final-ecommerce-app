export function renderButtonContainer(): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('button-container');
  container.id = 'button-container';
  const saveButton = document.createElement('button');
  saveButton.classList.add('save-button');
  saveButton.textContent = 'Сохранить';
  const cancelButton = document.createElement('button');
  cancelButton.classList.add('cancel-button');
  cancelButton.textContent = 'Отмена';
  container.append(saveButton, cancelButton);
  saveButton.addEventListener('click', () => {
    const form = document.querySelector('form');
    if (form) {
    }
  });
  cancelButton.addEventListener('click', () => {
    const form = document.querySelector('form');

    if (form) {
      form.dispatchEvent(new Event('reset'));
    }
  });
  return container;
}
