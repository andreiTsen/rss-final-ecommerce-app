import { Customer, CustomerSignInResult } from '@commercetools/platform-sdk';
import { apiRoot } from '../api';
import createErrorMessage from '../pages/loginPage/errorMessage';

export class AuthorizationService {
  private static authErrorElement: HTMLElement | null = null;
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'current_user';
  public static async login(email: string, password: string): Promise<boolean> {
    try {
      this.removeAuthError();
      const response = await apiRoot
        .me()
        .login()
        .post({
          body: {
            email,
            password,
            activeCartSignInMode: 'MergeWithExistingCustomerCart',
          },
        })
        .execute();
      this.saveAuthData(response.body);
      const authHeader = btoa(`${process.env.CT_CLIENT_ID}:${process.env.CT_CLIENT_SECRET}`);
      const token = await fetch(
        `${process.env.CT_AUTH_URL}oauth/${process.env.CT_PROJECT_KEY}/customers/token?grant_type=password&username=${email}&password=${password}&scope=manage_customers:${process.env.CT_PROJECT_KEY} manage_orders:${process.env.CT_PROJECT_KEY}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!token.ok) {
        throw new Error('Не удалось получить токен аутентификации');
      }

      return true;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      this.handleAuthorizationError(error);
      return false;
    }
  }
  public static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/login';
  }

  public static isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  public static getCurrentUser(): Customer | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  private static saveAuthData(data: CustomerSignInResult): void {
    if (data.customer) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.customer));
    }

    localStorage.setItem(this.TOKEN_KEY, 'authenticated');
  }
  private static handleAuthorizationError(error: unknown): void {
    let code;
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      code = error.statusCode;
    }
    let buttonLogin = document.querySelector('.auth-form__button-login');

    this.removeAuthError();
    let errorMessage;
    switch (code) {
      case 400:
        errorMessage = createErrorMessage('Данная учётная запись не найдена. Проверьте введённые данные!', 'auth-error');
        break;
      case 500:
        errorMessage = createErrorMessage('Сервер не доступен. Попробуйте позднее!', 'auth-error');
        break;
    }
    if (errorMessage) {
      buttonLogin?.before(errorMessage);
      this.authErrorElement = errorMessage;
    }
  }
  private static removeAuthError(): void {
    if (this.authErrorElement) {
      this.authErrorElement.remove();
      this.authErrorElement = null;
    }
  }
}
