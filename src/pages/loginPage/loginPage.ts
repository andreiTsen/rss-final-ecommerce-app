import { AuthorizationService } from '../../services/authentication';
import ElementCreator from '../../utils/ElementCreator';
import './../../pages/loginPage/loginPage.css';
import createErrorMessage from './errorMessage';
import validateEmail from './validateEmail';
import validatePassword from './validatePassword';

export default class loginPage {
  private container: HTMLElement;
  private loginInput: HTMLInputElement | null = null;
  private passwordInput: HTMLInputElement | null = null;
  private loginButton: HTMLButtonElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.append(this.createFormAuthorization());
    this.getFormElements();
  }

  public createFormAuthorization(): HTMLElement {
    const container = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-container'],
    });
    const form = new ElementCreator({
      tagName: 'form',
      classNames: ['auth-form'],
    });
    const titleForm = new ElementCreator({
      tagName: 'h2',
      classNames: ['auth-form__title'],
      textContent: 'Login',
    });
    container.addInnerElement(this.createTitleForm().getElement());
    container.addInnerElement(form);
    form.addInnerElement(titleForm);
    form.addInnerElement(this.createLoginInput());
    form.addInnerElement(this.createPasswordInput());
    form.addInnerElement(this.createButtonsBox());
    form.getElement().addEventListener('submit', async (event: Event): Promise<void> => {
      event.preventDefault();
      await this.handleLogin();
    });
    return container.getElement();
  }

  private getFormElements(): void {
    const loginInputElement = this.container.querySelector('.auth-form__input-login');
    const passwordInputElement = this.container.querySelector('.auth-form__input-password');
    const loginButtonElement = this.container.querySelector('.auth-form__button-login');

    if (loginInputElement instanceof HTMLInputElement) {
      this.loginInput = loginInputElement;
    }

    if (passwordInputElement instanceof HTMLInputElement) {
      this.passwordInput = passwordInputElement;
    }

    if (loginButtonElement instanceof HTMLButtonElement) {
      this.loginButton = loginButtonElement;
    }
  }

  private createTitleForm(): ElementCreator {
    const title = new ElementCreator({
      tagName: 'h1',
      classNames: ['auth-form__page-title'],
      textContent: 'Crazy Bookstore',
    });
    return title;
  }

  private createButtonsBox(): ElementCreator {
    const btnsBox = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-form__button-box'],
    });
    const textInfo = new ElementCreator({
      tagName: 'span',
      classNames: ['auth-form__info'],
      textContent: "Don't have an account?",
    });
    btnsBox.addInnerElement(this.createBtnLogin());
    btnsBox.addInnerElement(textInfo);
    btnsBox.addInnerElement(this.createBtnRegistration());
    return btnsBox;
  }

  private createLoginInput(): ElementCreator {
    const loginInputContainer = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-form__input-box', 'box-input'],
    });
    const loginInput = new ElementCreator({
      tagName: 'input',
      classNames: ['auth-form__input-login'],
      attribute: ['placeholder=Email', 'type=text', 'autocomplete=off'],
    });
    const loginInputIcon = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-form__login-icon'],
    });
    loginInputContainer.addInnerElement(loginInput);
    loginInputContainer.addInnerElement(loginInputIcon);
    loginInput.getElement().addEventListener('input', (event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        this.validationLogin(event.target.value);
      }
    });
    return loginInputContainer;
  }

  private validationLogin(value: string): void {
    let resultValidation = validateEmail(value);
    let container = document.querySelector('.box-input');

    const error = document.querySelector('.login-error');
    if (error) {
      error.remove();
    }

    if (!resultValidation.isValid) {
      let errorElement = createErrorMessage(resultValidation.message, 'login-error');
      container?.appendChild(errorElement);
    }
    this.updateBtnLoginState();
  }

  private validationPassword(value: string): void {
    let resultValidation = validatePassword(value);
    let container = document.querySelector('.password-box');

    const error = document.querySelector('.password-error');
    if (error) {
      error.remove();
    }

    if (!resultValidation.isValid) {
      let errorElement = createErrorMessage(resultValidation.message, 'password-error');
      container?.appendChild(errorElement);
    }
    this.updateBtnLoginState();
  }

  private checkFormValid(): boolean {
    if (!this.loginInput || !this.passwordInput) return false;

    const emailValidation = validateEmail(String(this.loginInput?.value));
    const passwordValidation = validatePassword(String(this.passwordInput?.value));
    return emailValidation.isValid && passwordValidation.isValid;
  }

  private updateBtnLoginState(): void {
    if (!this.loginButton) return;
    const valid = this.checkFormValid();
    if (valid) {
      this.loginButton.classList.remove('no-valid');
      this.loginButton.removeAttribute('disabled');
    } else {
      this.loginButton.setAttribute('disabled', 'true');
      this.loginButton.classList.add('no-valid');
    }
  }

  private createPasswordInput(): ElementCreator {
    const passwordInputContainer = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-form__input-box', 'password-box'],
    });
    const passwordInput = new ElementCreator({
      tagName: 'input',
      classNames: ['auth-form__input-password'],
      callback: (): void => console.log('Ввод в инпут пароля'),
      attribute: ['placeholder=Password', 'type=password', 'autocomplete=off'],
    });
    const passwordInputIcon = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-form__password-icon'],
    });
    passwordInput.getElement().addEventListener('input', (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        this.validationPassword(target.value);
      }
    });
    passwordInputIcon.getElement().addEventListener('click', () => {
      let attributeValue = passwordInput.getElement().getAttribute('type');
      if (attributeValue === 'password') {
        passwordInput.setAttributes(['type=text']);
      } else {
        passwordInput.setAttributes(['type=password']);
      }
    });
    passwordInputContainer.addInnerElement(passwordInput);
    passwordInputContainer.addInnerElement(passwordInputIcon);
    return passwordInputContainer;
  }

  private createBtnLogin(): ElementCreator {
    const buttonLogin = new ElementCreator({
      tagName: 'button',
      classNames: ['auth-form__button-login', 'auth--btn'],
      textContent: 'Login',
    });
    return buttonLogin;
  }

  private createBtnRegistration(): ElementCreator {
    const buttonRegistration = new ElementCreator({
      tagName: 'button',
      classNames: ['auth-form__button-register', 'auth--btn'],
      textContent: 'Register',
      callback: (): void => {
        window.location.href = '/register';
      },
    });
    return buttonRegistration;
  }

  private async handleLogin(): Promise<void> {
    this.getFormElements();
    if (!this.loginInput || !this.passwordInput || !this.loginButton) {
      console.error('Elements forms is not found!');
      return;
    }
    const loginValue = this.loginInput.value;
    const passwordValue = this.passwordInput.value;

    const emailValidation = validateEmail(String(loginValue));
    const passwordValidation = validatePassword(passwordValue);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      if (!emailValidation.isValid) {
        this.validationLogin(loginValue);
      }
      if (!passwordValidation.isValid) {
        this.validationPassword(passwordValue);
      }
      return;
    }

    try {
      const isLoggedIn = await AuthorizationService.login(loginValue, passwordValue);

      if (isLoggedIn) {
        // Перенаправление после успешного входа
        window.history.pushState({}, '', '/store');
        window.dispatchEvent(new PopStateEvent('popstate'));

      } else {
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
