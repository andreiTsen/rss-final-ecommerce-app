import { apiRoot } from '../api';
import { AuthService } from '../services/authService';
import { CustomerDraft } from '@commercetools/platform-sdk';

type UserAddress = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'shipping' | 'billing' | 'both';
};

type UserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  addresses: UserAddress[];
  useSameAddress: boolean;
};

type FormFields = {
  emailInput: HTMLInputElement | null;
  passwordInput: HTMLInputElement | null;
  firstNameInput: HTMLInputElement | null;
  lastNameInput: HTMLInputElement | null;
  yearInput: HTMLInputElement | null;
  monthInput: HTMLInputElement | null;
  dayInput: HTMLInputElement | null;
  shippingStreetInput: HTMLInputElement | null;
  shippingCityInput: HTMLInputElement | null;
  shippingPostalCodeInput: HTMLInputElement | null;
  shippingCountrySelect: HTMLSelectElement | null;
  billingStreetInput: HTMLInputElement | null;
  billingCityInput: HTMLInputElement | null;
  billingPostalCodeInput: HTMLInputElement | null;
  billingCountrySelect: HTMLSelectElement | null;
  sameAddressCheckbox: HTMLInputElement | null;
  defaultShippingAddressCheckbox: HTMLInputElement | null;
  defaultBillingAddressCheckbox: HTMLInputElement | null;
  streetInput: HTMLInputElement | null;
  cityInput: HTMLInputElement | null;
  postalCodeInput: HTMLInputElement | null;
  countrySelect: HTMLSelectElement | null;
};

type ErrorResponse = {
  statusCode: number;
  body?: {
    errors?: Array<{
      code?: string;
      field?: string;
      message?: string;
    }>;
  };
};

export class RegistrationPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private static getElement<T extends HTMLElement>(selector: string): T | null {
    return document.querySelector<T>(selector);
  }

  private static addDateValidationHandlers(dobGroup: HTMLDivElement): void {
    const yearInput = dobGroup.querySelector<HTMLInputElement>('#birthYear');
    const monthInput = dobGroup.querySelector<HTMLInputElement>('#birthMonth');
    const dayInput = dobGroup.querySelector<HTMLInputElement>('#birthDay');
    const dobError = dobGroup.querySelector<HTMLDivElement>('#dob-error');

    if (!yearInput || !monthInput || !dayInput || !dobError) return;

    const validateDate = (): void => {
      RegistrationPage.validateDateOfBirth(yearInput, monthInput, dayInput, dobError);
    };

    yearInput.addEventListener('change', validateDate);
    monthInput.addEventListener('change', validateDate);
    dayInput.addEventListener('change', validateDate);
  }

  private static checkDateFieldsFilled(
    yearInput: HTMLInputElement,
    monthInput: HTMLInputElement,
    dayInput: HTMLInputElement,
    errorElement: HTMLElement | null
  ): boolean {
    if (!yearInput.value || !monthInput.value || !dayInput.value) {
      if (errorElement) errorElement.textContent = 'Дата рождения обязательна для заполнения';
      return false;
    }
    return true;
  }

  private static checkDateValidAndAge(
    year: number,
    month: number,
    day: number,
    errorElement: HTMLElement | null
  ): boolean {
    const date = new Date(year, month, day);
    const now = new Date();
    const minAge = 13;

    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      if (errorElement) errorElement.textContent = 'Указана некорректная дата';
      return false;
    }

    if (date > now) {
      if (errorElement) errorElement.textContent = 'Дата рождения не может быть в будущем';
      return false;
    }

    const ageDate = new Date(now.getTime() - date.getTime());
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < minAge) {
      if (errorElement) errorElement.textContent = `Минимальный возраст для регистрации: ${minAge} лет`;
      return false;
    }

    if (errorElement) errorElement.textContent = '';
    return true;
  }

  private static checkDateValidity(date: Date, year: number, month: number, day: number): string {
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      return 'Указана некорректная дата';
    }

    const now = new Date();
    if (date > now) {
      return 'Дата рождения не может быть в будущем';
    }

    const minAge = 13;
    const ageDate = new Date(now.getTime() - date.getTime());
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < minAge) {
      return `Минимальный возраст для регистрации: ${minAge} лет`;
    }

    return '';
  }

  private static checkFieldsExist(fields: FormFields): boolean {
    return !!(
      fields.emailInput &&
      fields.passwordInput &&
      fields.firstNameInput &&
      fields.lastNameInput &&
      fields.yearInput &&
      fields.monthInput &&
      fields.dayInput &&
      fields.streetInput &&
      fields.cityInput &&
      fields.postalCodeInput &&
      fields.countrySelect
    );
  }

  private static createAddressSection(): HTMLDivElement {
    const addressSection = document.createElement('div');
    addressSection.className = 'address-section';

    const addressTitle = document.createElement('h3');
    addressTitle.textContent = 'Информация об адресе';
    addressSection.appendChild(addressTitle);

    const sameAddressCheckbox = RegistrationPage.createSameAddressCheckbox();
    addressSection.appendChild(sameAddressCheckbox);

    const shippingAddressSection = RegistrationPage.createShippingAddressSection();
    addressSection.appendChild(shippingAddressSection);

    const billingAddressSection = RegistrationPage.createBillingAddressSection();
    billingAddressSection.id = 'billing-address-section';
    billingAddressSection.style.display = 'none';
    addressSection.appendChild(billingAddressSection);

    const checkbox = sameAddressCheckbox.querySelector('#sameAddress');
    if (checkbox instanceof HTMLInputElement) {
      checkbox.addEventListener('change', () => {
        const billingSection = document.getElementById('billing-address-section');
        if (billingSection) {
          billingSection.style.display = checkbox.checked ? 'none' : 'block';
        }
      });
    }

    return addressSection;
  }

  private static createShippingAddressSection(): HTMLDivElement {
    const shippingSection = document.createElement('div');
    shippingSection.className = 'address-subsection shipping-address';

    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = 'Адрес доставки';
    sectionTitle.className = 'address-subsection-title';
    shippingSection.appendChild(sectionTitle);

    shippingSection.appendChild(RegistrationPage.createStreetField('shipping'));
    shippingSection.appendChild(RegistrationPage.createCityAndPostalFields('shipping'));
    shippingSection.appendChild(RegistrationPage.createCountryField('shipping'));

    const shippingAddressError = document.createElement('div');
    shippingAddressError.className = 'error-message';
    shippingAddressError.id = 'shipping-address-error';
    shippingSection.appendChild(shippingAddressError);

    shippingSection.appendChild(RegistrationPage.createDefaultAddressCheckbox('shipping'));

    return shippingSection;
  }

  private static createBillingAddressSection(): HTMLDivElement {
    const billingSection = document.createElement('div');
    billingSection.className = 'address-subsection billing-address';

    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = 'Адрес выставления счета';
    sectionTitle.className = 'address-subsection-title';
    billingSection.appendChild(sectionTitle);

    billingSection.appendChild(RegistrationPage.createStreetField('billing'));
    billingSection.appendChild(RegistrationPage.createCityAndPostalFields('billing'));
    billingSection.appendChild(RegistrationPage.createCountryField('billing'));

    const billingAddressError = document.createElement('div');
    billingAddressError.className = 'error-message';
    billingAddressError.id = 'billing-address-error';
    billingSection.appendChild(billingAddressError);

    billingSection.appendChild(RegistrationPage.createDefaultAddressCheckbox('billing'));

    return billingSection;
  }

  private static createCityAndPostalFields(type: 'shipping' | 'billing'): HTMLDivElement {
    const cityRow = document.createElement('div');
    cityRow.className = 'form-row';

    cityRow.appendChild(RegistrationPage.createCityField(type));
    cityRow.appendChild(RegistrationPage.createPostalCodeField(type));

    return cityRow;
  }

  private static createCityField(type: 'shipping' | 'billing'): HTMLDivElement {
    const cityGroup = document.createElement('div');
    cityGroup.className = 'form-group';

    const cityLabel = document.createElement('label');
    cityLabel.htmlFor = `${type}-city`;
    cityLabel.textContent = 'Город*';

    const cityInput = document.createElement('input');
    cityInput.type = 'text';
    cityInput.id = `${type}-city`;
    cityInput.name = `${type}-city`;
    cityInput.required = true;

    cityInput.addEventListener('input', (): void => {
      const errorElement = RegistrationPage.getElement<HTMLDivElement>(`#${type}-city-error`);
      if (errorElement) {
        if (!cityInput.value.trim()) {
          errorElement.textContent = 'Поле города обязательно для заполнения';
        } else if (cityInput.value.length < 2) {
          errorElement.textContent = 'Название города должно содержать минимум 2 символа';
        } else {
          errorElement.textContent = '';
        }
      }
    });

    const cityError = document.createElement('div');
    cityError.className = 'error-message';
    cityError.id = `${type}-city-error`;

    cityGroup.appendChild(cityLabel);
    cityGroup.appendChild(cityInput);
    cityGroup.appendChild(cityError);

    return cityGroup;
  }

  private static createCountryField(type: 'shipping' | 'billing'): HTMLDivElement {
    const countryGroup = document.createElement('div');
    countryGroup.className = 'form-group';

    const countryLabel = document.createElement('label');
    countryLabel.htmlFor = `${type}-country`;
    countryLabel.textContent = 'Страна*';
    countryGroup.appendChild(countryLabel);

    countryGroup.appendChild(RegistrationPage.createCountrySelect(type));

    const countryError = document.createElement('div');
    countryError.className = 'error-message';
    countryError.id = `${type}-country-error`;
    countryGroup.appendChild(countryError);

    return countryGroup;
  }

  private static createCountrySelect(type: 'shipping' | 'billing'): HTMLSelectElement {
    const countrySelect = document.createElement('select');
    countrySelect.id = `${type}-country`;
    countrySelect.name = `${type}-country`;
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

    RegistrationPage.addDateValidationHandlers(dobGroup);

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

  private static createDefaultAddressCheckbox(type: 'shipping' | 'billing'): HTMLDivElement {
    const defaultAddressGroup = document.createElement('div');
    defaultAddressGroup.className = 'form-group default-address';

    const defaultCheckboxGroup = document.createElement('div');
    defaultCheckboxGroup.className = 'checkbox-group';

    const defaultAddressCheckbox = document.createElement('input');
    defaultAddressCheckbox.type = 'checkbox';
    defaultAddressCheckbox.id = `default-${type}-address`;
    defaultAddressCheckbox.name = `default-${type}-address`;
    defaultAddressCheckbox.checked = type === 'shipping';

    const defaultAddressLabel = document.createElement('label');
    defaultAddressLabel.htmlFor = `default-${type}-address`;
    defaultAddressLabel.textContent =
      type === 'shipping'
        ? 'Установить как адрес доставки по умолчанию'
        : 'Установить как адрес выставления счета по умолчанию';
    defaultAddressLabel.className = 'default-address-label';

    const defaultAddressHint = document.createElement('p');
    defaultAddressHint.className = 'default-address-hint';
    defaultAddressHint.textContent =
      type === 'shipping'
        ? 'Этот адрес будет использоваться для доставки ваших заказов'
        : 'Этот адрес будет использоваться для выставления счетов';

    defaultCheckboxGroup.appendChild(defaultAddressCheckbox);
    defaultCheckboxGroup.appendChild(defaultAddressLabel);
    defaultAddressGroup.appendChild(defaultCheckboxGroup);
    defaultAddressGroup.appendChild(defaultAddressHint);

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

    emailInput.addEventListener('input', (): void => {
      const errorElement = RegistrationPage.getElement<HTMLDivElement>('#email-error');
      if (errorElement) {
        if (!emailInput.value) {
          errorElement.textContent = 'Поле электронной почты обязательно для заполнения';
        } else if (!RegistrationPage.isValidEmail(emailInput.value)) {
          errorElement.textContent = 'Пожалуйста, введите корректный адрес электронной почты';
        } else {
          errorElement.textContent = '';
        }
      }
    });

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

    firstNameInput.addEventListener('input', (): void => {
      const errorElement = RegistrationPage.getElement<HTMLDivElement>('#firstName-error');
      if (errorElement) {
        if (!firstNameInput.value.trim()) {
          errorElement.textContent = 'Поле имени обязательно для заполнения';
        } else if (firstNameInput.value.length < 2) {
          errorElement.textContent = 'Имя должно содержать минимум 2 символа';
        } else {
          errorElement.textContent = '';
        }
      }
    });

    const firstNameError = document.createElement('div');
    firstNameError.className = 'error-message';
    firstNameError.id = 'firstName-error';

    firstNameGroup.appendChild(firstNameLabel);
    firstNameGroup.appendChild(firstNameInput);
    firstNameGroup.appendChild(firstNameError);

    return firstNameGroup;
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

    form.addEventListener('submit', async (event: Event): Promise<void> => {
      event.preventDefault();

      if (RegistrationPage.validateForm(form)) {
        await RegistrationPage.submitForm(form);
      }
    });

    return form;
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

    lastNameInput.addEventListener('input', (): void => {
      const errorElement = RegistrationPage.getElement<HTMLDivElement>('#lastName-error');
      if (errorElement) {
        if (!lastNameInput.value.trim()) {
          errorElement.textContent = 'Поле фамилии обязательно для заполнения';
        } else if (lastNameInput.value.length < 2) {
          errorElement.textContent = 'Фамилия должна содержать минимум 2 символа';
        } else {
          errorElement.textContent = '';
        }
      }
    });

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
    loginAnchor.textContent = 'Вход тут, если уже естть учетная запись';

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

    passwordInput.addEventListener('input', (): void => {
      const errorElement = RegistrationPage.getElement<HTMLDivElement>('#password-error');
      if (errorElement) {
        if (!passwordInput.value) {
          errorElement.textContent = 'Поле пароля обязательно для заполнения';
        } else if (passwordInput.value.length < 8) {
          errorElement.textContent = 'Пароль должен содержать минимум 8 символов';
        } else if (!RegistrationPage.isStrongPassword(passwordInput.value)) {
          errorElement.textContent = 'Пароль должен содержать минимум одну цифру и одну заглавную букву';
        } else {
          errorElement.textContent = '';
        }
      }
    });

    const passwordError = document.createElement('div');
    passwordError.className = 'error-message';
    passwordError.id = 'password-error';

    passwordGroup.appendChild(passwordLabel);
    passwordGroup.appendChild(passwordInput);
    passwordGroup.appendChild(passwordError);

    return passwordGroup;
  }

  private static createPostalCodeField(type: 'shipping' | 'billing'): HTMLDivElement {
    const postalCodeGroup = document.createElement('div');
    postalCodeGroup.className = 'form-group';

    const postalCodeLabel = document.createElement('label');
    postalCodeLabel.htmlFor = `${type}-postalCode`;
    postalCodeLabel.textContent = 'Почтовый индекс*';

    const postalCodeInput = document.createElement('input');
    postalCodeInput.type = 'text';
    postalCodeInput.id = `${type}-postalCode`;
    postalCodeInput.name = `${type}-postalCode`;
    postalCodeInput.required = true;

    postalCodeInput.addEventListener('input', (): void => {
      const errorElement = RegistrationPage.getElement<HTMLDivElement>(`#${type}-postalCode-error`);
      if (errorElement) {
        if (!postalCodeInput.value.trim()) {
          errorElement.textContent = 'Поле почтового индекса обязательно для заполнения';
        } else if (!/^\d{5,6}$/.test(postalCodeInput.value)) {
          errorElement.textContent = 'Почтовый индекс должен содержать 5-6 цифр';
        } else {
          errorElement.textContent = '';
        }
      }
    });

    const postalCodeError = document.createElement('div');
    postalCodeError.className = 'error-message';
    postalCodeError.id = `${type}-postalCode-error`;

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
    sameAddressLabel.textContent = 'Использовать один адрес для доставки и выставления счета';
    sameAddressLabel.className = 'same-address-label';

    const sameAddressHint = document.createElement('p');
    sameAddressHint.className = 'same-address-hint';
    sameAddressHint.textContent = 'Снимите чекбокс, если хотите указать разные адреса для доставки и выставления счета';

    sameAddressGroup.appendChild(sameAddressCheckbox);
    sameAddressGroup.appendChild(sameAddressLabel);
    addressType.appendChild(sameAddressGroup);
    addressType.appendChild(sameAddressHint);

    return addressType;
  }

  private static createStreetField(type: 'shipping' | 'billing'): HTMLDivElement {
    const streetGroup = document.createElement('div');
    streetGroup.className = 'form-group';

    const streetLabel = document.createElement('label');
    streetLabel.htmlFor = `${type}-street`;
    streetLabel.textContent = 'Улица*';

    const streetInput = document.createElement('input');
    streetInput.type = 'text';
    streetInput.id = `${type}-street`;
    streetInput.name = `${type}-street`;
    streetInput.required = true;

    streetInput.addEventListener('input', (): void => {
      const errorElement = RegistrationPage.getElement<HTMLDivElement>(`#${type}-street-error`);
      if (errorElement) {
        if (!streetInput.value.trim()) {
          errorElement.textContent = 'Поле улицы обязательно для заполнения';
        } else if (streetInput.value.length < 3) {
          errorElement.textContent = 'Название улицы должно содержать минимум 3 символа';
        } else {
          errorElement.textContent = '';
        }
      }
    });

    const streetError = document.createElement('div');
    streetError.className = 'error-message';
    streetError.id = `${type}-street-error`;

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

  private static getFormFields(form: HTMLFormElement): FormFields {
    const shippingStreetInput = form.querySelector<HTMLInputElement>('#shipping-street');
    const shippingCityInput = form.querySelector<HTMLInputElement>('#shipping-city');
    const shippingPostalCodeInput = form.querySelector<HTMLInputElement>('#shipping-postalCode');
    const shippingCountrySelect = form.querySelector<HTMLSelectElement>('#shipping-country');

    return {
      emailInput: form.querySelector<HTMLInputElement>('#email'),
      passwordInput: form.querySelector<HTMLInputElement>('#password'),
      firstNameInput: form.querySelector<HTMLInputElement>('#firstName'),
      lastNameInput: form.querySelector<HTMLInputElement>('#lastName'),
      yearInput: form.querySelector<HTMLInputElement>('#birthYear'),
      monthInput: form.querySelector<HTMLInputElement>('#birthMonth'),
      dayInput: form.querySelector<HTMLInputElement>('#birthDay'),
      shippingStreetInput,
      shippingCityInput,
      shippingPostalCodeInput,
      shippingCountrySelect,
      billingStreetInput: form.querySelector<HTMLInputElement>('#billing-street'),
      billingCityInput: form.querySelector<HTMLInputElement>('#billing-city'),
      billingPostalCodeInput: form.querySelector<HTMLInputElement>('#billing-postalCode'),
      billingCountrySelect: form.querySelector<HTMLSelectElement>('#billing-country'),
      sameAddressCheckbox: form.querySelector<HTMLInputElement>('#sameAddress'),
      defaultShippingAddressCheckbox: form.querySelector<HTMLInputElement>('#default-shipping-address'),
      defaultBillingAddressCheckbox: form.querySelector<HTMLInputElement>('#default-billing-address'),
      streetInput: shippingStreetInput,
      cityInput: shippingCityInput,
      postalCodeInput: shippingPostalCodeInput,
      countrySelect: shippingCountrySelect,
    };
  }

  private static setupAddressSyncHandler(): void {
    const sameAddressCheckbox = document.getElementById('sameAddress');
    if (!(sameAddressCheckbox instanceof HTMLInputElement)) return;

    const billingFields = RegistrationPage.getBillingFields();

    sameAddressCheckbox.addEventListener('change', () => {
      RegistrationPage.updateBillingFieldsVisibility(sameAddressCheckbox, billingFields);
    });

    RegistrationPage.updateBillingFieldsVisibility(sameAddressCheckbox, billingFields);
  }

  private static getBillingFields(): HTMLElement[] {
    return [
      document.getElementById('billing-street'),
      document.getElementById('billing-city'),
      document.getElementById('billing-postalCode'),
      document.getElementById('billing-country'),
    ].filter((field): field is HTMLElement => field !== null);
  }

  private static updateBillingFieldsVisibility(
    sameAddressCheckbox: HTMLInputElement,
    billingFields: HTMLElement[]
  ): void {
    const billingSection = document.getElementById('billing-address-section');

    if (sameAddressCheckbox.checked) {
      if (billingSection) {
        billingSection.style.display = 'none';
      }

      billingFields.forEach((field) => {
        field.removeAttribute('required');
      });
    } else {
      if (billingSection) {
        billingSection.style.display = 'block';
      }

      billingFields.forEach((field) => {
        field.setAttribute('required', 'true');
      });
    }
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

  private static isStrongPassword(password: string): boolean {
    return /\d/.test(password) && /[A-Z]/.test(password);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static parseDateValues(
    yearInput: HTMLInputElement,
    monthInput: HTMLInputElement,
    dayInput: HTMLInputElement,
    errorElement: HTMLElement | null
  ): { year: number; month: number; day: number; isValid: boolean } {
    const year = parseInt(yearInput.value);
    const month = parseInt(monthInput.value) - 1;
    const day = parseInt(dayInput.value);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      if (errorElement) errorElement.textContent = 'Указана некорректная дата';
      return { year, month, day, isValid: false };
    }

    return { year, month, day, isValid: true };
  }

  private static async submitForm(form: HTMLFormElement): Promise<void> {
    const submitButton = RegistrationPage.prepareFormSubmission(form);

    const userData = RegistrationPage.collectFormData(form);

    const result = await RegistrationPage.registerUser(userData);

    RegistrationPage.resetSubmitButton(submitButton);

    RegistrationPage.handleRegistrationResult(result);
  }

  private static prepareFormSubmission(form: HTMLFormElement): HTMLButtonElement | null {
    const submitButton = form.querySelector<HTMLButtonElement>('.btn-register');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Регистрация...';
    }
    return submitButton;
  }

  private static resetSubmitButton(submitButton: HTMLButtonElement | null): void {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Зарегистрироваться';
    }
  }

  private static handleRegistrationResult(result: { success: boolean; message: string }): void {
    if (result.success) {
      RegistrationPage.showSuccessMessage(result.message);

      RegistrationPage.redirectAfterRegistration();
    } else {
      RegistrationPage.showErrorMessage(result.message);
    }
  }

  private static redirectAfterRegistration(): void {
    if (AuthService.isAuthenticated()) {
      setTimeout(() => {
        window.history.pushState({}, '', '/store');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 2000);
    } else {
      setTimeout(() => {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 3000);
    }
  }

  private static createMessageElement(type: 'success' | 'error', message: string): HTMLDivElement {
    const messageElement = document.createElement('div');
    messageElement.className = `message-container ${type}-message`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageIcon = document.createElement('span');
    messageIcon.className = 'message-icon';
    messageIcon.textContent = type === 'success' ? '✓' : '!';
    messageContent.appendChild(messageIcon);

    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageContent.appendChild(messageText);

    messageElement.appendChild(messageContent);

    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      messageElement.remove();
    });

    messageElement.appendChild(closeButton);

    return messageElement;
  }

  private static showSuccessMessage(message: string): void {
    RegistrationPage.removeMessages();

    const messageElement = RegistrationPage.createMessageElement('success', message);
    document.body.appendChild(messageElement);

    setTimeout(() => {
      if (document.body.contains(messageElement)) {
        messageElement.remove();
      }
    }, 5000);
  }

  private static showErrorMessage(message: string): void {
    RegistrationPage.removeMessages();

    const messageElement = RegistrationPage.createMessageElement('error', message);
    document.body.appendChild(messageElement);

    setTimeout(() => {
      if (document.body.contains(messageElement)) {
        messageElement.remove();
      }
    }, 5000);
  }

  private static removeMessages(): void {
    const messages = document.querySelectorAll('.message-container');
    messages.forEach((message) => message.remove());
  }

  private static collectFormData(form: HTMLFormElement): UserData {
    const formData = new FormData(form);
    const useSameAddress = this.isCheckboxChecked(formData, 'sameAddress');

    const addresses: UserAddress[] = this.collectAddresses(formData, useSameAddress);

    return {
      email: this.getFormValue(formData, 'email'),
      password: this.getFormValue(formData, 'password'),
      firstName: this.getFormValue(formData, 'firstName'),
      lastName: this.getFormValue(formData, 'lastName'),
      dateOfBirth: this.formatDateOfBirth(formData),
      addresses,
      useSameAddress,
    };
  }

  private static getFormValue(formData: FormData, key: string): string {
    const value = formData.get(key);
    return value instanceof File ? '' : (value || '').toString();
  }

  private static isCheckboxChecked(formData: FormData, key: string): boolean {
    return this.getFormValue(formData, key) === 'on';
  }

  private static formatDateOfBirth(formData: FormData): string {
    return `${this.getFormValue(formData, 'birthYear')}-${this.getFormValue(formData, 'birthMonth')}-${this.getFormValue(formData, 'birthDay')}`;
  }

  private static collectAddresses(formData: FormData, useSameAddress: boolean): UserAddress[] {
    const addresses: UserAddress[] = [];

    addresses.push({
      street: this.getFormValue(formData, 'shipping-street'),
      city: this.getFormValue(formData, 'shipping-city'),
      postalCode: this.getFormValue(formData, 'shipping-postalCode'),
      country: this.getFormValue(formData, 'shipping-country'),
      isDefault: this.isCheckboxChecked(formData, 'default-shipping-address'),
      type: useSameAddress ? 'both' : 'shipping',
    });

    if (!useSameAddress) {
      addresses.push({
        street: this.getFormValue(formData, 'billing-street'),
        city: this.getFormValue(formData, 'billing-city'),
        postalCode: this.getFormValue(formData, 'billing-postalCode'),
        country: this.getFormValue(formData, 'billing-country'),
        isDefault: this.isCheckboxChecked(formData, 'default-billing-address'),
        type: 'billing',
      });
    }

    return addresses;
  }

  private static validateCity(cityInput: HTMLInputElement, type: 'shipping' | 'billing'): boolean {
    const cityError = document.getElementById(`${type}-city-error`);
    if (!cityInput.value.trim()) {
      if (cityError) cityError.textContent = 'Поле города обязательно для заполнения';
      return false;
    } else if (cityInput.value.length < 2) {
      if (cityError) cityError.textContent = 'Название города должно содержать минимум 2 символа';
      return false;
    }

    if (cityError) cityError.textContent = '';
    return true;
  }

  private static validateCountry(countrySelect: HTMLSelectElement, type: 'shipping' | 'billing'): boolean {
    const countryError = document.getElementById(`${type}-country-error`);
    if (!countrySelect.value) {
      if (countryError) countryError.textContent = 'Пожалуйста, выберите страну';
      return false;
    }

    if (countryError) countryError.textContent = '';
    return true;
  }

  private static validateCredentials(emailInput: HTMLInputElement, passwordInput: HTMLInputElement): boolean {
    let isValid = true;

    const emailError = document.getElementById('email-error');
    if (!emailInput.value) {
      if (emailError) emailError.textContent = 'Поле электронной почты обязательно для заполнения';
      isValid = false;
    } else if (!RegistrationPage.isValidEmail(emailInput.value)) {
      if (emailError) emailError.textContent = 'Пожалуйста, введите корректный адрес электронной почты';
      isValid = false;
    } else if (emailError) {
      emailError.textContent = '';
    }

    isValid = RegistrationPage.validatePassword(passwordInput) && isValid;

    return isValid;
  }

  private static validateDateFields(
    yearInput: HTMLInputElement,
    monthInput: HTMLInputElement,
    dayInput: HTMLInputElement
  ): boolean {
    const dobError = document.getElementById('dob-error');

    if (!RegistrationPage.checkDateFieldsFilled(yearInput, monthInput, dayInput, dobError)) {
      return false;
    }

    const { year, month, day, isValid } = RegistrationPage.parseDateValues(yearInput, monthInput, dayInput, dobError);
    if (!isValid) return false;

    return RegistrationPage.checkDateValidAndAge(year, month, day, dobError);
  }

  private static validateDateOfBirth(
    yearInput: HTMLInputElement,
    monthInput: HTMLInputElement,
    dayInput: HTMLInputElement,
    errorElement: HTMLDivElement
  ): void {
    if (!yearInput.value || !monthInput.value || !dayInput.value) {
      errorElement.textContent = '';
      return;
    }

    const year = parseInt(yearInput.value);
    const month = parseInt(monthInput.value) - 1;
    const day = parseInt(dayInput.value);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      errorElement.textContent = '';
      return;
    }

    const date = new Date(year, month, day);

    const validationResult = RegistrationPage.checkDateValidity(date, year, month, day);
    errorElement.textContent = validationResult;
  }

  private static validateForm(form: HTMLFormElement): boolean {
    const fields = RegistrationPage.getFormFields(form);

    if (!RegistrationPage.checkFieldsExist(fields)) {
      console.error('Не все поля формы найдены');
      return false;
    }

    return RegistrationPage.validateAllFields(fields);
  }

  private static validateAllFields(fields: FormFields): boolean {
    let isValid = true;

    if (fields.emailInput && fields.passwordInput) {
      isValid = RegistrationPage.validateCredentials(fields.emailInput, fields.passwordInput) && isValid;
    } else {
      isValid = false;
    }

    if (fields.firstNameInput && fields.lastNameInput) {
      isValid = RegistrationPage.validateNameFields(fields.firstNameInput, fields.lastNameInput) && isValid;
    } else {
      isValid = false;
    }

    if (fields.yearInput && fields.monthInput && fields.dayInput) {
      isValid = RegistrationPage.validateDateFields(fields.yearInput, fields.monthInput, fields.dayInput) && isValid;
    } else {
      isValid = false;
    }

    if (fields.streetInput && fields.cityInput && fields.postalCodeInput && fields.countrySelect) {
      isValid =
        RegistrationPage.validateAddressFields(
          fields.streetInput,
          fields.cityInput,
          fields.postalCodeInput,
          fields.countrySelect,
          'shipping'
        ) && isValid;
    } else {
      isValid = false;
    }

    return isValid;
  }

  private static validateNameFields(firstNameInput: HTMLInputElement, lastNameInput: HTMLInputElement): boolean {
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

  private static validatePassword(passwordInput: HTMLInputElement): boolean {
    const passwordError = document.getElementById('password-error');
    if (!passwordInput.value) {
      if (passwordError) passwordError.textContent = 'Поле пароля обязательно для заполнения';
      return false;
    } else if (passwordInput.value.length < 8) {
      if (passwordError) passwordError.textContent = 'Пароль должен содержать минимум 8 сімволов';
      return false;
    } else if (!RegistrationPage.isStrongPassword(passwordInput.value)) {
      if (passwordError)
        passwordError.textContent = 'Пароль должен содержать минимум одну цифру и одну заглавную букву';
      return false;
    }

    if (passwordError) passwordError.textContent = '';
    return true;
  }

  private static validatePostalCode(postalCodeInput: HTMLInputElement, type: 'shipping' | 'billing'): boolean {
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

  private static validateStreet(streetInput: HTMLInputElement, type: 'shipping' | 'billing'): boolean {
    const streetError = document.getElementById(`${type}-street-error`);
    if (!streetInput.value.trim()) {
      if (streetError) streetError.textContent = 'Поле улицы обязательно для заполнения';
      return false;
    } else if (streetInput.value.length < 3) {
      if (streetError) streetError.textContent = 'Название улицы должно содержать минимум 3 символа';
      return false;
    }

    if (streetError) streetError.textContent = '';
    return true;
  }

  private static validateAddressFields(
    streetInput: HTMLInputElement,
    cityInput: HTMLInputElement,
    postalCodeInput: HTMLInputElement,
    countrySelect: HTMLSelectElement,
    type: 'shipping' | 'billing'
  ): boolean {
    let isValid = true;

    isValid = RegistrationPage.validateStreet(streetInput, type) && isValid;
    isValid = RegistrationPage.validateCity(cityInput, type) && isValid;
    isValid = RegistrationPage.validatePostalCode(postalCodeInput, type) && isValid;
    isValid = RegistrationPage.validateCountry(countrySelect, type) && isValid;

    const defaultAddressCheckbox = document.getElementById(`default-${type}-address`);
    const addressErrorContainer = document.getElementById(`${type}-address-error`);

    if (
      defaultAddressCheckbox instanceof HTMLInputElement &&
      defaultAddressCheckbox.checked &&
      !isValid &&
      addressErrorContainer
    ) {
      addressErrorContainer.textContent = `Для установки адреса ${type === 'shipping' ? 'доставки' : 'выставления счета'} по умолчанію необходимо правільно заполнить все поля`;
    } else if (addressErrorContainer) {
      addressErrorContainer.textContent = '';
    }

    return isValid;
  }

  private static createCustomerDraft(userData: UserData): CustomerDraft {
    const addresses = userData.addresses.map((address) => ({
      streetName: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
    }));

    let defaultShippingAddressIndex: number | undefined;
    let defaultBillingAddressIndex: number | undefined;

    userData.addresses.forEach((address, index) => {
      if (address.isDefault) {
        if (address.type === 'shipping' || address.type === 'both') {
          defaultShippingAddressIndex = index;
        }
        if (address.type === 'billing' || address.type === 'both') {
          defaultBillingAddressIndex = index;
        }
      }
    });

    return {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      addresses,
      defaultShippingAddress: defaultShippingAddressIndex,
      defaultBillingAddress: defaultBillingAddressIndex,
    };
  }

  private static getStatusCode(error: unknown): number | null {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      const statusCode = error.statusCode;
      if (typeof statusCode === 'number') {
        return statusCode;
      }
    }
    return null;
  }

  private static getErrorBody(error: unknown): ErrorResponse['body'] | null {
    if (typeof error === 'object' && error !== null && 'body' in error) {
      return error.body || null;
    }
    return null;
  }

  private static handleRegistrationError(error: unknown): { success: boolean; message: string } {
    console.error('Ошібка регистрации юзера:', error);

    const statusCode = RegistrationPage.getStatusCode(error);

    if (statusCode !== null) {
      if (statusCode === 400) {
        return RegistrationPage.handleBadRequestError(error);
      }

      if (statusCode >= 500) {
        return {
          success: false,
          message: 'Ошибка на сервере. Попробуйте позже.',
        };
      }
    }

    return {
      success: false,
      message: 'Ошибка регистрации. Попробуйте позже.',
    };
  }

  private static handleBadRequestError(error: unknown): { success: boolean; message: string } {
    const body = RegistrationPage.getErrorBody(error);

    if (body && body.errors && Array.isArray(body.errors)) {
      const hasDuplicateEmail = body.errors.some(
        (errorItem) => errorItem.code === 'DuplicateField' && errorItem.field === 'email'
      );

      if (hasDuplicateEmail) {
        return {
          success: false,
          message: 'Юзер с этим email уже существует. Используйте другой email',
        };
      }
    }

    return {
      success: false,
      message: 'Проверьте правильность введенных данных',
    };
  }

  private static async registerUser(userData: UserData): Promise<{ success: boolean; message: string }> {
    try {
      const customerDraft = RegistrationPage.createCustomerDraft(userData);

      const response = await apiRoot
        .customers()
        .post({
          body: customerDraft,
        })
        .execute();

      console.log('Юзер зарегистрирован:', response);

      return RegistrationPage.handleSuccessfulRegistration(userData);
    } catch (error: unknown) {
      return RegistrationPage.handleRegistrationError(error);
    }
  }

  private static async handleSuccessfulRegistration(
    userData: UserData
  ): Promise<{ success: boolean; message: string }> {
    const successMessage = this.createSuccessMessage(userData);

    const loginSuccess = await AuthService.login(userData.email, userData.password);

    return this.createRegistrationResult(successMessage, loginSuccess);
  }

  private static createSuccessMessage(userData: UserData): string {
    let successMessage = 'Регистрация завершена!';

    if (userData.useSameAddress) {
      successMessage += this.createSingleAddressMessage(userData.addresses);
    } else {
      successMessage += this.createMultipleAddressesMessage(userData.addresses);
    }

    return successMessage;
  }

  private static createSingleAddressMessage(addresses: UserAddress[]): string {
    const defaultAddress = addresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      return ' Ваш адрес сохранен как адрес по умолчанию для доставки и выставления счета.';
    } else {
      return ' Ваш адрес сохранен для доставки и выставления счета.';
    }
  }

  private static createMultipleAddressesMessage(addresses: UserAddress[]): string {
    const defaultShippingAddress = addresses.find((addr) => addr.type === 'shipping' && addr.isDefault);
    const defaultBillingAddress = addresses.find((addr) => addr.type === 'billing' && addr.isDefault);

    if (defaultShippingAddress && defaultBillingAddress) {
      return ' Ваши адреса сохранены как адреса по умолчанию для доставки и выставления счета.';
    } else if (defaultShippingAddress) {
      return ' Ваш адрес доставки сохранен как адрес по умолчанию.';
    } else if (defaultBillingAddress) {
      return ' Ваш адрес выставления счета сохранен как адрес по умолчанию.';
    } else {
      return ' Ваши адреса доставки и выставления счета сохранены.';
    }
  }

  private static createRegistrationResult(
    successMessage: string,
    loginSuccess: boolean
  ): { success: boolean; message: string } {
    if (loginSuccess) {
      return {
        success: true,
        message: `${successMessage} Входим в систему...`,
      };
    } else {
      return {
        success: true,
        message: `${successMessage} Войдите в систему.`,
      };
    }
  }

  private render(): void {
    this.container.textContent = '';

    const registrationContainer = RegistrationPage.createMainContainer();
    const form = RegistrationPage.createForm();

    registrationContainer.appendChild(form);
    this.container.appendChild(registrationContainer);

    RegistrationPage.setupAddressSyncHandler();
  }
}

export default RegistrationPage;
