import { ApiRequest, Cart, ClientResponse } from '@commercetools/platform-sdk';
import { customerApiRoot } from './customerApi';

export class CartService {
  private static activeCart: Cart | null = null;
  private static apiRoot = customerApiRoot;

  public static async getActiveCart(): Promise<Cart | null> {
    try {
      const response: ClientResponse<Cart> = await this.apiRoot.me().activeCart().get().execute();
      this.activeCart = response.body;
      return this.activeCart;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
