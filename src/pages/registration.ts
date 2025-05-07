export class RegistrationPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private static createAddressSection(): HTMLDivElement {
    const addressSection = document.createElement('div');
    addressSection.className = 'address-section';

    const addressTitle = document.createElement('h3');
    addressTitle.textContent = 'Информация об адресе';
    addressSection.appendChild(addressTitle);

    addressSection.appendChild(RegistrationPage.createSameAddressCheckbox());

    addressSection.appendChild(RegistrationPage.createStreetField());
    addressSection.appendChild(RegistrationPage.createCityAndPostalFields());
    addressSection.appendChild(RegistrationPage.createCountryField());
    addressSection.appendChild(RegistrationPage.createDefaultAddressCheckbox());

    return addressSection;
  }

  private static createCityAndPostalFields(): HTMLDivElement {
    const cityRow = document.createElement('div');
    cityRow.className = 'form-row';

    cityRow.appendChild(RegistrationPage.createCityField());
    cityRow.appendChild(RegistrationPage.createPostalCodeField());

    return cityRow;
  }

  private static createCityField(): HTMLDivElement {
    const cityGroup = document.createElement('div');
    cityGroup.className = 'form-group';

    const cityLabel = document.createElement('label');
    cityLabel.htmlFor = 'city';
    cityLabel.textContent = 'Город*';

    const cityInput = document.createElement('input');
    cityInput.type = 'text';
    cityInput.id = 'city';
    cityInput.name = 'city';
    cityInput.required = true;

    const cityError = document.createElement('div');
    cityError.className = 'error-message';
    cityError.id = 'city-error';

    cityGroup.appendChild(cityLabel);
    cityGroup.appendChild(cityInput);
    cityGroup.appendChild(cityError);

    return cityGroup;
  }

  private static createCountryField(): HTMLDivElement {
    const countryGroup = document.createElement('div');
    countryGroup.className = 'form-group';

    const countryLabel = document.createElement('label');
    countryLabel.htmlFor = 'country';
    countryLabel.textContent = 'Страна*';
    countryGroup.appendChild(countryLabel);

    countryGroup.appendChild(RegistrationPage.createCountrySelect());

    const countryError = document.createElement('div');
    countryError.className = 'error-message';
    countryError.id = 'country-error';
    countryGroup.appendChild(countryError);

    return countryGroup;
  }

  private static createCountrySelect(): HTMLSelectElement {
    const countrySelect = document.createElement('select');
    countrySelect.id = 'country';
    countrySelect.name = 'country';
    countrySelect.required = true;

    const countries = [
      { value: '', text: 'Выберите страну' },
      { value: 'US', text: 'США' },
      { value: 'CA', text: 'Канада' },
      { value: 'UK', text: 'Великобритания' },
      { value: 'DE', text: 'Германия' },
      { value: 'FR', text: 'Франция' },
      { value: 'BY', text: 'Беларусь' },
      { value: 'UA', text: 'Украина' },
    ];

    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country.value;
      option.textContent = country.text;
      countrySelect.appendChild(option);
    });

    return countrySelect;
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

  private static createDefaultAddressCheckbox(): HTMLDivElement {
    const defaultAddressGroup = document.createElement('div');
    defaultAddressGroup.className = 'form-group default-address';

    const defaultCheckboxGroup = document.createElement('div');
    defaultCheckboxGroup.className = 'checkbox-group';

    const defaultAddressCheckbox = document.createElement('input');
    defaultAddressCheckbox.type = 'checkbox';
    defaultAddressCheckbox.id = 'defaultAddress';
    defaultAddressCheckbox.name = 'defaultAddress';

    const defaultAddressLabel = document.createElement('label');
    defaultAddressLabel.htmlFor = 'defaultAddress';
    defaultAddressLabel.textContent = 'Установить как адрес по умолчанию';

    defaultCheckboxGroup.appendChild(defaultAddressCheckbox);
    defaultCheckboxGroup.appendChild(defaultAddressLabel);
    defaultAddressGroup.appendChild(defaultCheckboxGroup);

    return defaultAddressGroup;
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

  private static createLoginLink(): HTMLDivElement {
    const loginLink = document.createElement('div');
    loginLink.className = 'login-link';

    const loginText = document.createTextNode('Уже есть аккаунт? ');
    const loginAnchor = document.createElement('a');
    loginAnchor.href = '/login';
    loginAnchor.textContent = 'Войти здесь';

    loginLink.appendChild(loginText);
    loginLink.appendChild(loginAnchor);

    return loginLink;
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

  private static createNameFields(): HTMLDivElement {
    const nameRow = document.createElement('div');
    nameRow.className = 'form-row';

    nameRow.appendChild(RegistrationPage.createFirstNameField());
    nameRow.appendChild(RegistrationPage.createLastNameField());

    return nameRow;
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

  private static createPostalCodeField(): HTMLDivElement {
    const postalCodeGroup = document.createElement('div');
    postalCodeGroup.className = 'form-group';

    const postalCodeLabel = document.createElement('label');
    postalCodeLabel.htmlFor = 'postalCode';
    postalCodeLabel.textContent = 'Почтовый индекс*';

    const postalCodeInput = document.createElement('input');
    postalCodeInput.type = 'text';
    postalCodeInput.id = 'postalCode';
    postalCodeInput.name = 'postalCode';
    postalCodeInput.required = true;

    const postalCodeError = document.createElement('div');
    postalCodeError.className = 'error-message';
    postalCodeError.id = 'postalCode-error';

    postalCodeGroup.appendChild(postalCodeLabel);
    postalCodeGroup.appendChild(postalCodeInput);
    postalCodeGroup.appendChild(postalCodeError);

    return postalCodeGroup;
  }

  private static createSameAddressCheckbox(): HTMLDivElement {
    const addressType = document.createElement('div');
    addressType.className = 'address-type';

    const sameAddressGroup = document.createElement('div');
    sameAddressGroup.className = 'checkbox-group';

    const sameAddressCheckbox = document.createElement('input');
    sameAddressCheckbox.type = 'checkbox';
    sameAddressCheckbox.id = 'sameAddress';
    sameAddressCheckbox.name = 'sameAddress';
    sameAddressCheckbox.checked = true;

    const sameAddressLabel = document.createElement('label');
    sameAddressLabel.htmlFor = 'sameAddress';
    sameAddressLabel.textContent = 'Использовать один адрес для доставки и оплаты';

    sameAddressGroup.appendChild(sameAddressCheckbox);
    sameAddressGroup.appendChild(sameAddressLabel);
    addressType.appendChild(sameAddressGroup);

    return addressType;
  }

  private static createStreetField(): HTMLDivElement {
    const streetGroup = document.createElement('div');
    streetGroup.className = 'form-group';

    const streetLabel = document.createElement('label');
    streetLabel.htmlFor = 'street';
    streetLabel.textContent = 'Улица*';

    const streetInput = document.createElement('input');
    streetInput.type = 'text';
    streetInput.id = 'street';
    streetInput.name = 'street';
    streetInput.required = true;

    const streetError = document.createElement('div');
    streetError.className = 'error-message';
    streetError.id = 'street-error';

    streetGroup.appendChild(streetLabel);
    streetGroup.appendChild(streetInput);
    streetGroup.appendChild(streetError);

    return streetGroup;
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

    if (inputElement.value !== '' && (parseInt(inputElement.value) < 1 || parseInt(inputElement.value) > 31)) {
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

    if (inputElement.value !== '' && (parseInt(inputElement.value) < 1 || parseInt(inputElement.value) > 12)) {
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
    form.appendChild(RegistrationPage.createAddressSection());
    form.appendChild(RegistrationPage.createFormActions());
    form.appendChild(RegistrationPage.createLoginLink());

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
