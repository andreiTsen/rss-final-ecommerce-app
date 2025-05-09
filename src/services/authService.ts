import { apiRoot } from '../api';
import { CustomerSignInResult, Customer } from '@commercetools/platform-sdk';

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'current_user';

  public static async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await apiRoot
        .login()
        .post({
          body: {
            email,
            password,
          },
        })
        .execute();

      this.saveAuthData(response.body);
      return true;
    } catch (error) {
      console.error('Ошибка при входе:', error);
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
}
