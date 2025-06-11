import { Customer, ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import { createUserApiClient } from './authApiClient';
import { CartService } from './cartService';

export class AuthorizationService {
  private static readonly AUTH_TOKEN_KEY = 'authToken';
  private static readonly USER_KEY = 'user';
  private static readonly USER_CREDENTIALS_KEY = 'userCredentials';

  public static async login(email: string, password: string): Promise<boolean> {
    try {
      const userApiRoot = createUserApiClient(email, password);
      const response = await userApiRoot.me().get().execute();

      if (response.body) {
        const userData = {
          id: response.body.id,
          email: response.body.email,
          firstName: response.body.firstName,
          lastName: response.body.lastName,
          version: response.body.version,
        };

        localStorage.setItem(this.AUTH_TOKEN_KEY, 'authenticated');
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        localStorage.setItem(this.USER_CREDENTIALS_KEY, JSON.stringify({ email, password }));

        CartService.clearCartCache();
        await CartService.mergeAnonymousCartOnLogin();

        return true;
      }

      return false;
    } catch (error) {
      console.error('Ошибка входа:', error);
      return false;
    }
  }

  public static logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.USER_CREDENTIALS_KEY);

    CartService.clearCartCache();
  }

  public static isAuthenticated(): boolean {
    const authToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);

    const isAuth = authToken === 'authenticated' && !!user;

    return isAuth;
  }

  public static getToken(): string {
    if (!this.isAuthenticated()) {
      throw new Error('Ощібка аутентіфікаціі');
    }
    return localStorage.getItem(this.AUTH_TOKEN_KEY) || '';
  }

  public static getCurrentUser(): Customer | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);
      return user;
    } catch (error) {
      console.error('Ошибка полученія данных', error);
      return null;
    }
  }

  public static updateCurrentUser(customer: Customer): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(customer));
  }

  public static getUserApiClient(): ByProjectKeyRequestBuilder | null {
    try {
      const credentials = localStorage.getItem(this.USER_CREDENTIALS_KEY);
      if (credentials) {
        const { email, password } = JSON.parse(credentials);
        return createUserApiClient(email, password);
      }
      return null;
    } catch (error) {
      console.error('Ошибка созданія апі кліента:', error);
      return null;
    }
  }

  public static checkAuthState(): boolean {
    const authToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    const credentials = localStorage.getItem(this.USER_CREDENTIALS_KEY);

    return authToken === 'authenticated' && !!user && !!credentials;
  }
}
