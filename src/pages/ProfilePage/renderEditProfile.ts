import { UserData } from "./sectionProfile";
import { renderButtonContainer } from "./buttonContainer";

export function renderEditProfileForm(user: UserData): HTMLElement {
  const form = document.createElement('form');
  form.id = 'edit-profile-form';
  form.classList.add('edit-profile-form');
  const title = document.createElement('h2');
  title.textContent = 'Редактировать профиль';
  const editInfo = [
    { label: 'Имя', name: 'firstName' },
    { label: 'Фамилия', name: 'lastName' },
    { label: 'Email', name: 'email' },
    { label: 'Дата рождения', name: 'dateOfBirth' },
  ] as const;
  const editInfoElements = editInfo.map((info) => {
    const label = document.createElement('label');
    label.textContent = info.label;
    const input = document.createElement('input');
    if (info.name === 'dateOfBirth') {
      input.type = 'date';
    }
    input.type = 'text';
    input.name = info.name;
    input.placeholder = info.label;
    input.value = user[info.name] || '';
    return { label, input };
  });
  
  const submitButton = renderButtonContainer();

  form.append(title, ...editInfoElements.map(({ label, input }) => {
    const div = document.createElement('div');
    div.append(label, input);
    return div;
  }), submitButton);
  return form;
}
