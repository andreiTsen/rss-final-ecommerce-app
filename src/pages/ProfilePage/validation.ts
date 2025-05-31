
export function validateNameFields(
  firstNameInput: HTMLInputElement,
  lastNameInput: HTMLInputElement
): boolean {
  let isValid = true;

  const firstNameError = document.getElementById('firstName-error');
  if (!firstNameInput.value.trim()) {
    if (firstNameError) firstNameError.textContent = 'Поле имени обязательно для заполнения';
    isValid = false;
  } else if (firstNameInput.value.length < 2) {
    if (firstNameError) firstNameError.textContent = 'Имя должно содержать минимум 2 символа';
    isValid = false;
  } else if (firstNameError) {
    firstNameError.textContent = '';
  }

  const lastNameError = document.getElementById('lastName-error');
  if (!lastNameInput.value.trim()) {
    if (lastNameError) lastNameError.textContent = 'Поле фамилии обязательно для заполнения';
    isValid = false;
  } else if (lastNameInput.value.length < 2) {
    if (lastNameError) lastNameError.textContent = 'Фамилия должна содержать минимум 2 символа';
    isValid = false;
  } else if (lastNameError) {
    lastNameError.textContent = '';
  }

  return isValid;
}

export function validatePostalCode(
  postalCodeInput: HTMLInputElement,
  type: string 
): boolean {
  const postalCodeError = document.getElementById(`${type}-postalCode-error`);
  if (!postalCodeInput.value.trim()) {
    if (postalCodeError) postalCodeError.textContent = 'Поле почтового индекса обязательно для заполнения';
    return false;
  } else if (!/^\d{5,6}$/.test(postalCodeInput.value)) {
    if (postalCodeError) postalCodeError.textContent = 'Почтовый индекс должен содержать 5-6 цифр';
    return false;
  }
  if (postalCodeError) postalCodeError.textContent = '';
  return true;
}
