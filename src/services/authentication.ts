import { Customer, CustomerSignInResult, Product, ProductProjection } from '@commercetools/platform-sdk';
import { apiRoot } from '../api';
import createErrorMessage from '../pages/loginPage/errorMessage';
import { customerApiRoot } from './customerApi';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export class AuthorizationService {
  private static authErrorElement: HTMLElement | null = null;
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly TOKEN_EXPIRES = 'token_expires';
  private static readonly REFRESH_KEY = 'refresh_token';
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
      const authHeader = btoa(`${process.env.CT_CLIENT_ID}:${process.env.CT_CLIENT_SECRET}`);
      const token = await fetch(
        `${process.env.CT_AUTH_URL}oauth/${process.env.CT_PROJECT_KEY}/customers/token?grant_type=password&username=${email}&password=${password}&scope=manage_customers:${process.env.CT_PROJECT_KEY} view_published_products:${process.env.CT_PROJECT_KEY} manage_my_profile:${process.env.CT_PROJECT_KEY} view_orders:${process.env.CT_PROJECT_KEY}`,
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
      const tokenData: TokenResponse = await token.json();
      this.saveAuthData(response.body, tokenData);
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
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES);
  }

  public static isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  public static getToken(): string {
    if (!this.isAuthenticated()) {
      throw new Error('User is not authenticated');
    }
    return localStorage.getItem(this.TOKEN_KEY) || '';
  }

  public static getCurrentUser(): Customer | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  private static saveAuthData(data: CustomerSignInResult, tokenData: TokenResponse): void {
    if (data.customer) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.customer));
    }
    localStorage.setItem(this.TOKEN_KEY, tokenData.access_token);
    localStorage.setItem(this.REFRESH_KEY, tokenData.refresh_token);

    const expiresAt = new Date().getTime() + tokenData.expires_in * 1000;
    localStorage.setItem(this.TOKEN_EXPIRES, expiresAt.toString());
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
        errorMessage = createErrorMessage(
          'Данная учётная запись не найдена. Проверьте введённые данные!',
          'auth-error'
        );
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
