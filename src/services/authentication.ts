import { ClientBuilder, createAuthForPasswordFlow, TokenCache } from '@commercetools/sdk-client-v2';
import { apiRoot, authMiddlewareOptions } from '../api';
import { CustomerSignInResult, Customer, createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';

export class AuthorizationService {

  public static async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await apiRoot.me()
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
      return false;
    }
  }

}
