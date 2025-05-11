import { ClientBuilder, createAuthForPasswordFlow, TokenCache } from '@commercetools/sdk-client-v2';
import { apiRoot, authMiddlewareOptions } from '../api';
import { CustomerSignInResult, Customer, createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';



export class AuthorizationService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'current_user';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  public static async login(email: string, password: string): Promise<boolean> {
    try {
      // const user = new ClientBuilder().withProjectKey(process.env.CT_PROJECT_KEY || '').withPasswordFlow({
      //     host: process.env.CT_AUTH_URL || '',
      //     projectKey: process.env.CT_PROJECT_KEY || '',
      //     credentials: {
      //       clientId: process.env.CT_CLIENT_ID || '',
      //       clientSecret: process.env.CT_CLIENT_SECRET || '',
      //       user: {
      //         username: email,
      //         password: password,
      //       },
      //     },
      //     scopes: [
      //       `manage_customers:${process.env.CT_PROJECT_KEY}`,
      //       `manage_my_profile:${process.env.CT_PROJECT_KEY}`
      //     ],
      //     fetch,
      //   }).withHttpMiddleware(authMiddlewareOptions).build();
      //  const passwordApiRoot = createApiBuilderFromCtpClient(user).withProjectKey({projectKey: process.env.CT_PROJECT_KEY || ''})
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
      console.log("Вход успешен")
      return true;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return false;
    }
  }

//   public static logout(): void {
//     localStorage.removeItem(this.TOKEN_KEY);
//     localStorage.removeItem(this.USER_KEY);
//     localStorage.removeItem(this.REFRESH_TOKEN_KEY)
//   }

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