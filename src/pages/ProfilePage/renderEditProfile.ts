// import { UserData } from "./sectionProfile";

// export function renderEditProfileForm(user: UserData): HTMLElement {
//   const wrapper = document.getElementById('profile-info');
//   console.log(wrapper);
//   // const form = document.createElement('form');

//   // const [firstNameLabel, firstNameInput] = createTextInput('text', user.firstName, 'Имя:');
//   // const [lastNameLabel, lastNameInput] = createTextInput('text', user.lastName, 'Фамилия:');
//   // // и так далее...

//   // const saveButton = createSaveButton(() => {
//   //   // логика сохранения
//   // });

//   // form.append(firstNameLabel, firstNameInput, lastNameLabel, lastNameInput, saveButton);
//   // wrapper.append(form);

//   return wrapper;
// }

// function createTextInput(type: string, value: string, labelText: string): [HTMLLabelElement, HTMLInputElement] {
//   const label = document.createElement('label');
//   label.textContent = labelText;
//   const input = document.createElement('input');
//   input.type = type;
//   input.value = value || '';
//   return [label, input];
// }

// function createSaveButton(onClick: () => void): HTMLButtonElement {
//   const btn = document.createElement('button');
//   btn.textContent = 'Сохранить';
//   btn.classList.add('save-button');
//   btn.addEventListener('click', (e) => {
//     e.preventDefault();
//     onClick();
//   });
//   return btn;
// }
