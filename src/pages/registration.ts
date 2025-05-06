export class RegistrationPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private static createEmailField(): HTMLDivElement {
    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';

    const emailLabel = document.createElement('label');
    emailLabel.htmlFor = 'email';
    emailLabel.textContent = 'Электронная почта*';

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'email';
    emailInput.name = 'email';
    emailInput.required = true;

    const emailError = document.createElement('div');
    emailError.className = 'error-message';
    emailError.id = 'email-error';

    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    emailGroup.appendChild(emailError);

    return emailGroup;
  }

  private static createPasswordField(): HTMLDivElement {
    const passwordGroup = document.createElement('div');
    passwordGroup.className = 'form-group';

    const passwordLabel = document.createElement('label');
    passwordLabel.htmlFor = 'password';
    passwordLabel.textContent = 'Пароль*';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.name = 'password';
    passwordInput.required = true;

    const passwordError = document.createElement('div');
    passwordError.className = 'error-message';
    passwordError.id = 'password-error';

    passwordGroup.appendChild(passwordLabel);
    passwordGroup.appendChild(passwordInput);
    passwordGroup.appendChild(passwordError);

    return passwordGroup;
  }

  private static createFirstNameField(): HTMLDivElement {
    const firstNameGroup = document.createElement('div');
    firstNameGroup.className = 'form-group';

    const firstNameLabel = document.createElement('label');
    firstNameLabel.htmlFor = 'firstName';
    firstNameLabel.textContent = 'Имя*';

    const firstNameInput = document.createElement('input');
    firstNameInput.type = 'text';
    firstNameInput.id = 'firstName';
    firstNameInput.name = 'firstName';
    firstNameInput.required = true;

    const firstNameError = document.createElement('div');
    firstNameError.className = 'error-message';
    firstNameError.id = 'firstName-error';

    firstNameGroup.appendChild(firstNameLabel);
    firstNameGroup.appendChild(firstNameInput);
    firstNameGroup.appendChild(firstNameError);

    return firstNameGroup;
  }

  private static createLastNameField(): HTMLDivElement {
    const lastNameGroup = document.createElement('div');
    lastNameGroup.className = 'form-group';

    const lastNameLabel = document.createElement('label');
    lastNameLabel.htmlFor = 'lastName';
    lastNameLabel.textContent = 'Фамилия*';

    const lastNameInput = document.createElement('input');
    lastNameInput.type = 'text';
    lastNameInput.id = 'lastName';
    lastNameInput.name = 'lastName';
    lastNameInput.required = true;

    const lastNameError = document.createElement('div');
    lastNameError.className = 'error-message';
    lastNameError.id = 'lastName-error';

    lastNameGroup.appendChild(lastNameLabel);
    lastNameGroup.appendChild(lastNameInput);
    lastNameGroup.appendChild(lastNameError);

    return lastNameGroup;
  }

  private static createNameFields(): HTMLDivElement {
    const nameRow = document.createElement('div');
    nameRow.className = 'form-row';

    nameRow.appendChild(RegistrationPage.createFirstNameField());
    nameRow.appendChild(RegistrationPage.createLastNameField());

    return nameRow;
  }

  private static createDateOfBirthFields(): HTMLDivElement {
    const dobGroup = document.createElement('div');
    dobGroup.className = 'form-group';

    const dobLabel = document.createElement('label');
    dobLabel.textContent = 'Дата рождения*';
    dobGroup.appendChild(dobLabel);

    const dobFieldsContainer = document.createElement('div');
    dobFieldsContainer.className = 'dob-fields';

    dobFieldsContainer.appendChild(RegistrationPage.createYearField());
    dobFieldsContainer.appendChild(RegistrationPage.createMonthField());
    dobFieldsContainer.appendChild(RegistrationPage.createDayField());

    dobGroup.appendChild(dobFieldsContainer);

    const dobError = document.createElement('div');
    dobError.className = 'error-message';
    dobError.id = 'dob-error';
    dobGroup.appendChild(dobError);

    return dobGroup;
  }

  private static createDayField(): HTMLDivElement {
    const dayContainer = document.createElement('div');
    dayContainer.className = 'dob-field-container';

    const dayLabel = document.createElement('label');
    dayLabel.htmlFor = 'birthDay';
    dayLabel.textContent = 'День';
    dayLabel.className = 'dob-field-label';

    const dayInput = document.createElement('input');
    dayInput.type = 'text';
    dayInput.id = 'birthDay';
    dayInput.name = 'birthDay';
    dayInput.className = 'dob-field';
    dayInput.placeholder = 'ДД';
    dayInput.maxLength = 2;
    dayInput.required = true;
    dayInput.pattern = '\\d{1,2}';

    dayInput.addEventListener('input', RegistrationPage.handleDayInput);

    dayContainer.appendChild(dayLabel);
    dayContainer.appendChild(dayInput);

    return dayContainer;
  }

  private static createMonthField(): HTMLDivElement {
    const monthContainer = document.createElement('div');
    monthContainer.className = 'dob-field-container';

    const monthLabel = document.createElement('label');
    monthLabel.htmlFor = 'birthMonth';
    monthLabel.textContent = 'Месяц';
    monthLabel.className = 'dob-field-label';

    const monthInput = document.createElement('input');
    monthInput.type = 'text';
    monthInput.id = 'birthMonth';
    monthInput.name = 'birthMonth';
    monthInput.className = 'dob-field';
    monthInput.placeholder = 'ММ';
    monthInput.maxLength = 2;
    monthInput.required = true;
    monthInput.pattern = '\\d{1,2}';

    monthInput.addEventListener('input', RegistrationPage.handleMonthInput);

    monthContainer.appendChild(monthLabel);
    monthContainer.appendChild(monthInput);

    return monthContainer;
  }

  private static createYearField(): HTMLDivElement {
    const yearContainer = document.createElement('div');
    yearContainer.className = 'dob-field-container';

    const yearLabel = document.createElement('label');
    yearLabel.htmlFor = 'birthYear';
    yearLabel.textContent = 'Год';
    yearLabel.className = 'dob-field-label';

    const yearInput = document.createElement('input');
    yearInput.type = 'text';
    yearInput.id = 'birthYear';
    yearInput.name = 'birthYear';
    yearInput.className = 'dob-field';
    yearInput.placeholder = 'ГГГГ';
    yearInput.maxLength = 4;
    yearInput.required = true;
    yearInput.pattern = '\\d{4}';

    yearInput.addEventListener('input', RegistrationPage.handleYearInput);

    yearContainer.appendChild(yearLabel);
    yearContainer.appendChild(yearInput);

    return yearContainer;
  }

  private static handleDayInput(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const inputElement = event.target;
    const numericValue = inputElement.value.replace(/[^0-9]/g, '');
    inputElement.value = numericValue;

    const value = parseInt(inputElement.value);
    if (inputElement.value !== '' && (value < 1 || value > 31)) {
      inputElement.setCustomValidity('День должен быть от 1 до 31');
    } else {
      inputElement.setCustomValidity('');
    }
  }

  private static handleMonthInput(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const inputElement = event.target;
    const numericValue = inputElement.value.replace(/[^0-9]/g, '');
    inputElement.value = numericValue;

    const value = parseInt(inputElement.value);
    if (inputElement.value !== '' && (value < 1 || value > 12)) {
      inputElement.setCustomValidity('Месяц должен быть от 1 до 12');
    } else {
      inputElement.setCustomValidity('');
    }
  }

  private static handleYearInput(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const inputElement = event.target;
    const numericValue = inputElement.value.replace(/[^0-9]/g, '');
    inputElement.value = numericValue;
  }

  private static createFormActions(): HTMLDivElement {
    const formActions = document.createElement('div');
    formActions.className = 'form-actions';

    const registerButton = document.createElement('button');
    registerButton.type = 'submit';
    registerButton.className = 'btn-register';
    registerButton.textContent = 'Зарегистрироваться';

    formActions.appendChild(registerButton);

    return formActions;
  }

  private static createMainContainer(): HTMLDivElement {
    const registrationContainer = document.createElement('div');
    registrationContainer.className = 'registration-container';

    const storeTitle = document.createElement('h1');
    storeTitle.className = 'store-title';
    storeTitle.textContent = 'Crazy Bookstore';

    registrationContainer.appendChild(storeTitle);

    return registrationContainer;
  }

  private static createForm(): HTMLFormElement {
    const form = document.createElement('form');
    form.className = 'registration-form';

    const formTitle = document.createElement('h2');
    formTitle.textContent = 'Регистрация';
    form.appendChild(formTitle);

    form.appendChild(RegistrationPage.createEmailField());
    form.appendChild(RegistrationPage.createPasswordField());
    form.appendChild(RegistrationPage.createNameFields());
    form.appendChild(RegistrationPage.createDateOfBirthFields());
    form.appendChild(RegistrationPage.createFormActions());

    return form;
  }

  private render(): void {
    this.container.textContent = '';

    const registrationContainer = RegistrationPage.createMainContainer();
    const form = RegistrationPage.createForm();

    registrationContainer.appendChild(form);
    this.container.appendChild(registrationContainer);
  }
}

export default RegistrationPage;
