import ElementCreator from '../../utils/ElementCreator';
import './../../pages/loginPage/loginPage.css';
import validateEmail from './validateEmail';
import validatePassword from './validatePassword';

export default class loginPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.append(this.createFormAuthorization());
  }

  public createFormAuthorization(): HTMLElement {
    const form = new ElementCreator({
      tagName: 'form',
      classNames: ['auth-form'],
    });
    const titleForm = new ElementCreator({
      tagName: 'h2',
      classNames: ['auth-form__title'],
      textContent: 'Login',
    });
    form.addInnerElement(titleForm);
    form.addInnerElement(this.createLoginInput());
    form.addInnerElement(this.createPasswordInput());
    form.addInnerElement(this.createButtonsBox());
    return form.getElement();
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
      classNames: ['auth-form__input-box', "box-input"],
    });
    const loginInput = new ElementCreator({
      tagName: 'input',
      classNames: ['auth-form__input-login'],
      attribute: ['placeholder=Email', 'type=text', 'autocomplete=off'],
    });
    const loginInputIcon = new ElementCreator({
      tagName: 'img',
      classNames: ['auth-form__login-icon'],
    });
    loginInputContainer.addInnerElement(loginInput);
    loginInputContainer.addInnerElement(loginInputIcon);
    loginInput.getElement().addEventListener("change", (event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        this.validationLogin(event.target.value)
      }
    })
    return loginInputContainer;
  }

  private validationLogin(value: string): void {
    let resultValidation = validateEmail(value);
    let container = document.querySelector(".box-input");

    const error = document.querySelector(".error-message");
    if (error) {
      error.remove();
    }

    if (!resultValidation.isValid) {
      let errorElement = this.createErrorMessage(resultValidation.message)
      container?.appendChild(errorElement);
    }
  }

  private validationPassword(value: string): void {
    let resultValidation = validatePassword(value);
    let container = document.querySelector(".password-box");

    const error = document.querySelector(".error-message");
    if (error) {
      error.remove();
    }

    if (!resultValidation.isValid) {
      let errorElement = this.createErrorMessage(resultValidation.message)
      container?.appendChild(errorElement)
  }
}

  private createErrorMessage(text: string): HTMLElement {
    const error = document.createElement("span");
    error.classList.add('error-message');
    error.textContent = text;
    return error;
  }

  private createPasswordInput(): ElementCreator {
    const passwordInputContainer = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-form__input-box', "password-box"],
    });
    const passwordInput = new ElementCreator({
      tagName: 'input',
      classNames: ['auth-form__input-password'],
      callback: (): void => console.log('Ввод в инпут пароля'),
      attribute: ['placeholder=Password', 'type=password', 'autocomplete=off'],
    });
    const passwordInputIcon = new ElementCreator({
      tagName: 'img',
      classNames: ['auth-form__password-icon'],
    });
    passwordInput.getElement().addEventListener("change", (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement) {
        this.validationPassword(target.value);
      }
    })
    passwordInputContainer.addInnerElement(passwordInput);
    passwordInputContainer.addInnerElement(passwordInputIcon);
    return passwordInputContainer;
  }

  private createBtnLogin(): ElementCreator {
    const buttonLogin = new ElementCreator({
      tagName: 'button',
      classNames: ['auth-form__button-login', 'auth--btn'],
      textContent: 'Login',
      callback: (): void => console.log('Авторизация'),
    });
    return buttonLogin;
  }

  private createBtnRegistration(): ElementCreator {
    const buttonRegistration = new ElementCreator({
      tagName: 'button',
      classNames: ['auth-form__button-register', 'auth--btn'],
      textContent: 'Register',
      callback: (): void => console.log('Переход на страницу регистрации'),
    });
    return buttonRegistration;
  }

}
