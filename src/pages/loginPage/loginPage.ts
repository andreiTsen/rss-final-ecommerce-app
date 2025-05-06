import ElementCreator from '../../utils/ElementCreator';

export class loginPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public static createFormAuthorization(): ElementCreator {
    const form = new ElementCreator({
      tagName: 'form',
      classNames: ['auth-form'],
    });
    return form;
  }

  public static createLoginInput(): ElementCreator {
    const loginInputContainer = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-form__input-box'],
    });
    const loginInput = new ElementCreator({
      tagName: 'input',
      classNames: ['auth-form__input-login'],
      callback: (): void => console.log('Ввод в инпут логина'),
      attribute: ['placeholder=Email', 'type=text', 'autocomplete=off'],
    });
    const loginInputIcon = new ElementCreator({
      tagName: 'img',
      classNames: ['auth-form__login-icon'],
    });
    loginInputContainer.addInnerElement(loginInput);
    loginInputContainer.addInnerElement(loginInputIcon);
    return loginInputContainer;
  }

  public static createPasswordInput(): ElementCreator {
    const passwordInputContainer = new ElementCreator({
      tagName: 'div',
      classNames: ['auth-form__input-box'],
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
      callback: (): void => console.log('Клик на иконку пароля'),
    });
    passwordInputContainer.addInnerElement(passwordInput);
    passwordInputContainer.addInnerElement(passwordInputIcon);
    return passwordInputContainer;
  }
}
