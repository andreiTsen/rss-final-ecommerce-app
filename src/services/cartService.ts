import {
  Cart,
  LineItem,
  CartDraft,
  MyCartDraft,
  Product,
  MyCartUpdateAction,
  ByProjectKeyRequestBuilder,
} from '@commercetools/platform-sdk';
import { apiRoot } from '../api';
import { AuthorizationService } from './authentication';

export type CartData = {
  id: string;
  version: number;
  lineItems: CartLineItem[];
  totalPrice: number;
  currency: string;
  itemCount: number;
};

export type CartLineItem = {
  id: string;
  productId: string;
  productKey?: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  imageUrl?: string;
};

export class CartService {
  private static currentCart: CartData | null = null;
  private static defaultTaxCategoryId: string | null = null;
  private static cartUpdateCallbacks: Array<(cart: CartData) => void> = [];
  private static isInitializing: boolean = false;

  public static onCartUpdate(callback: (cart: CartData) => void): void {
    this.cartUpdateCallbacks.push(callback);

    if (this.currentCart && !this.isInitializing) {
      try {
        callback(this.currentCart);
      } catch (error) {
        console.error('Ошибка в callback', error);
      }
    }
  }

  public static resetCallbacks(): void {
    this.cartUpdateCallbacks = [];
  }

  public static async getOrCreateCart(): Promise<CartData> {
    try {
      if (this.currentCart && !this.isInitializing) {
        return this.currentCart;
      }

      if (this.isInitializing) {
        await this.waitForInitialization();
        if (this.currentCart) {
          return this.currentCart;
        }
      }

      this.isInitializing = true;
      const cart = await this.initializeCart();
      this.isInitializing = false;
      return cart;
    } catch (error) {
      this.isInitializing = false;
      console.error('Ошибка создаіия корзины:', error);
      throw error;
    }
  }

  public static async addProductToCart(productId: string, quantity: number = 1): Promise<CartData> {
    try {
      const isAuthenticated = AuthorizationService.isAuthenticated();
      let updatedCart: CartData;

      if (isAuthenticated) {
        await this.ensureProductHasTaxCategory(productId);
        updatedCart = await this.addToUserCart(productId, quantity);
      } else {
        updatedCart = await this.addToAnonymousCart(productId, quantity);
      }

      this.currentCart = updatedCart;
      this.notifyCartUpdate(updatedCart);

      return updatedCart;
    } catch (error) {
      console.error('Ошибка добавления товара', error);
      throw error;
    }
  }

  public static async removeProductFromCart(lineItemId: string): Promise<CartData> {
    try {
      const cart = await this.getOrCreateCart();
      const isAuthenticated = AuthorizationService.isAuthenticated();

      const updatedCart = await this.executeRemoveLineItem(cart, lineItemId, isAuthenticated);

      this.currentCart = updatedCart;
      this.notifyCartUpdate(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Ошибка удаления товара', error);
      throw error;
    }
  }

  public static async updateProductQuantity(lineItemId: string, quantity: number): Promise<CartData> {
    try {
      const cart = await this.getOrCreateCart();
      const isAuthenticated = AuthorizationService.isAuthenticated();

      const updatedCart = await this.executeQuantityUpdate(cart, lineItemId, quantity, isAuthenticated);

      this.currentCart = updatedCart;
      this.notifyCartUpdate(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Ошибка измененія товара:', error);
      throw error;
    }
  }

  public static async clearCart(): Promise<CartData> {
    try {
      const cart = await this.getOrCreateCart();

      if (cart.lineItems.length === 0) {
        return cart;
      }

      const isAuthenticated = AuthorizationService.isAuthenticated();
      const updatedCart = await this.executeClearCart(cart, isAuthenticated);

      this.currentCart = updatedCart;
      this.notifyCartUpdate(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
      throw error;
    }
  }

  public static async mergeAnonymousCartOnLogin(): Promise<void> {
    try {
      const anonymousCartId = localStorage.getItem('anonymousCartId');

      if (!anonymousCartId) {
        return;
      }

      const userApiClient = AuthorizationService.getUserApiClient();
      if (!userApiClient) {
        return;
      }

      await this.performCartMerge(anonymousCartId, userApiClient);
    } catch {
      console.error('Ошибка объединения корзин');
      localStorage.removeItem('anonymousCartId');
    }
  }

  public static clearCartCache(): void {
    this.currentCart = null;
    this.defaultTaxCategoryId = null;
    this.resetCallbacks();
  }

  public static getCurrentCart(): CartData | null {
    return this.currentCart;
  }

  private static async waitForInitialization(): Promise<void> {
    let attempts = 0;
    while (this.isInitializing && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  }

  private static async initializeCart(): Promise<CartData> {
    const isAuthenticated = AuthorizationService.isAuthenticated();

    if (isAuthenticated) {
      return await this.getOrCreateUserCart();
    } else {
      return await this.getOrCreateAnonymousCart();
    }
  }

  private static async executeRemoveLineItem(
    cart: CartData,
    lineItemId: string,
    isAuthenticated: boolean
  ): Promise<CartData> {
    const action: MyCartUpdateAction = {
      action: 'removeLineItem',
      lineItemId,
    };

    if (isAuthenticated) {
      return await this.executeUserCartAction(cart, [action]);
    } else {
      return await this.executeAnonymousCartAction(cart, [action]);
    }
  }

  private static async executeQuantityUpdate(
    cart: CartData,
    lineItemId: string,
    quantity: number,
    isAuthenticated: boolean
  ): Promise<CartData> {
    const action: MyCartUpdateAction = {
      action: 'changeLineItemQuantity',
      lineItemId,
      quantity,
    };

    if (isAuthenticated) {
      return await this.executeUserCartAction(cart, [action]);
    } else {
      return await this.executeAnonymousCartAction(cart, [action]);
    }
  }

  private static async executeClearCart(cart: CartData, isAuthenticated: boolean): Promise<CartData> {
    const actions: MyCartUpdateAction[] = cart.lineItems.map((item) => ({
      action: 'removeLineItem',
      lineItemId: item.id,
    }));

    if (isAuthenticated) {
      return await this.executeUserCartAction(cart, actions);
    } else {
      return await this.executeAnonymousCartAction(cart, actions);
    }
  }

  private static async executeUserCartAction(cart: CartData, actions: MyCartUpdateAction[]): Promise<CartData> {
    const userApiClient = AuthorizationService.getUserApiClient();
    if (!userApiClient) {
      throw new Error('Не смоглі получить API клиент пользователя');
    }

    const response = await userApiClient
      .me()
      .carts()
      .withId({ ID: cart.id })
      .post({
        body: {
          version: cart.version,
          actions,
        },
      })
      .execute();

    return this.mapCartToData(response.body);
  }

  private static async executeAnonymousCartAction(cart: CartData, actions: MyCartUpdateAction[]): Promise<CartData> {
    const response = await apiRoot
      .carts()
      .withId({ ID: cart.id })
      .post({
        body: {
          version: cart.version,
          actions,
        },
      })
      .execute();

    return this.mapCartToData(response.body);
  }

  private static async performCartMerge(
    anonymousCartId: string,
    userApiClient: ByProjectKeyRequestBuilder
  ): Promise<void> {
    const anonymousCart = await this.getAnonymousCartForMerge(anonymousCartId);

    if (anonymousCart.lineItems.length > 0) {
      await this.ensureTaxCategoriesForItems(anonymousCart.lineItems);
      const userCart = await this.getOrCreateUserCartForMerge(userApiClient);
      await this.mergeCartItems(userApiClient, userCart, anonymousCart);
    }

    await this.cleanupAnonymousCart(anonymousCartId, anonymousCart.version);
  }

  private static async getAnonymousCartForMerge(anonymousCartId: string): Promise<Cart> {
    const response = await apiRoot.carts().withId({ ID: anonymousCartId }).get().execute();

    return response.body;
  }

  private static async ensureTaxCategoriesForItems(lineItems: LineItem[]): Promise<void> {
    for (const item of lineItems) {
      await this.ensureProductHasTaxCategory(item.productId);
    }
  }

  private static async getOrCreateUserCartForMerge(userApiClient: ByProjectKeyRequestBuilder): Promise<Cart> {
    try {
      const userCartResponse = await userApiClient.me().activeCart().get().execute();
      return userCartResponse.body;
    } catch {
      const createResponse = await userApiClient
        .me()
        .carts()
        .post({
          body: {
            currency: 'EUR',
          },
        })
        .execute();
      return createResponse.body;
    }
  }

  private static async mergeCartItems(
    userApiClient: ByProjectKeyRequestBuilder,
    userCart: Cart,
    anonymousCart: Cart
  ): Promise<void> {
    const actions: MyCartUpdateAction[] = anonymousCart.lineItems.map((item) => ({
      action: 'addLineItem',
      productId: item.productId,
      quantity: item.quantity,
    }));

    const response = await userApiClient
      .me()
      .carts()
      .withId({ ID: userCart.id })
      .post({
        body: {
          version: userCart.version,
          actions,
        },
      })
      .execute();

    const mergedCart = this.mapCartToData(response.body);
    this.currentCart = mergedCart;
    this.notifyCartUpdate(mergedCart);
  }

  private static async cleanupAnonymousCart(anonymousCartId: string, version: number): Promise<void> {
    await apiRoot
      .carts()
      .withId({ ID: anonymousCartId })
      .delete({
        queryArgs: {
          version,
        },
      })
      .execute();

    localStorage.removeItem('anonymousCartId');
  }

  private static notifyCartUpdate(cart: CartData): void {
    this.cartUpdateCallbacks.forEach((callback, index) => {
      try {
        callback(cart);
      } catch (error) {
        console.error(`Ошибка callback ${index + 1}:`, error);
      }
    });

    this.updateNavigationDirectly(cart);
  }

  private static updateNavigationDirectly(cart: CartData): void {
    try {
      const cartLink = document.getElementById('cart-link');
      if (cartLink) {
        const itemCount = cart.itemCount || 0;
        cartLink.textContent = itemCount > 0 ? `🛒 Корзина (${itemCount})` : '🛒 Корзина';
      }
    } catch (error) {
      console.error('Ошибка обновленія навигации:', error);
    }
  }

  private static async getOrCreateDefaultTaxCategory(): Promise<string> {
    if (this.defaultTaxCategoryId) {
      return this.defaultTaxCategoryId;
    }

    const existingCategory = await this.findExistingTaxCategory();
    if (existingCategory) {
      this.defaultTaxCategoryId = existingCategory;
      return existingCategory;
    }

    return await this.createDefaultTaxCategory();
  }

  private static async findExistingTaxCategory(): Promise<string | null> {
    try {
      const response = await apiRoot
        .taxCategories()
        .get({
          queryArgs: {
            where: 'name="Default Tax Category"',
            limit: 1,
          },
        })
        .execute();

      if (response.body.results.length > 0) {
        const categoryId = response.body.results[0].id;
        return categoryId;
      }

      return null;
    } catch (error) {
      console.error('Ошибка налоговой категории:', error);
      return null;
    }
  }

  private static async createDefaultTaxCategory(): Promise<string> {
    try {
      const response = await apiRoot
        .taxCategories()
        .post({
          body: {
            name: 'Default Tax Category',
            key: 'default-tax-category',
            description: 'Default tax category with zero tax rate',
            rates: [
              {
                name: 'Zero Tax Rate',
                amount: 0,
                includedInPrice: false,
                country: 'DE',
              },
            ],
          },
        })
        .execute();

      this.defaultTaxCategoryId = response.body.id;
      return this.defaultTaxCategoryId;
    } catch (error) {
      console.error('Ошибка созданія налоговой категории:', error);
      throw new Error('Не удалось создать налоговую категорію');
    }
  }

  private static async ensureProductHasTaxCategory(productId: string): Promise<void> {
    try {
      const product = await this.getProductById(productId);
      const needsTaxCategory = this.checkIfProductNeedsTaxCategory(product);

      if (needsTaxCategory) {
        await this.addTaxCategoryToProduct(productId, product.version);
      }
    } catch (error) {
      console.error('Ошибка добавленія налоговой категории к товару:', error);
      console.warn('Продолжаем без налоговой категоріі');
    }
  }

  private static async getProductById(productId: string): Promise<Product> {
    const response = await apiRoot.products().withId({ ID: productId }).get().execute();

    return response.body;
  }

  private static checkIfProductNeedsTaxCategory(product: Product): boolean {
    if (
      'masterData' in product &&
      product.masterData &&
      'current' in product.masterData &&
      product.masterData.current &&
      (!('taxCategory' in product.masterData.current) || !product.masterData.current.taxCategory)
    ) {
      return true;
    }

    return false;
  }

  private static async addTaxCategoryToProduct(productId: string, version: number): Promise<void> {
    const taxCategoryId = await this.getOrCreateDefaultTaxCategory();

    await apiRoot
      .products()
      .withId({ ID: productId })
      .post({
        body: {
          version,
          actions: [
            {
              action: 'setTaxCategory',
              taxCategory: {
                typeId: 'tax-category',
                id: taxCategoryId,
              },
            },
          ],
        },
      })
      .execute();
  }

  private static async getOrCreateUserCart(): Promise<CartData> {
    const userApiClient = AuthorizationService.getUserApiClient();
    if (!userApiClient) {
      throw new Error('Ошибка полученія API клиента пользователя');
    }

    try {
      const response = await userApiClient.me().activeCart().get().execute();
      const cart = this.mapCartToData(response.body);
      this.currentCart = cart;
      this.notifyCartUpdate(cart);
      return cart;
    } catch {
      return await this.createUserCart();
    }
  }

  private static async createUserCart(): Promise<CartData> {
    const userApiClient = AuthorizationService.getUserApiClient();
    if (!userApiClient) {
      throw new Error('Ошібка полученія API клиента пользователя');
    }

    const cartDraft: MyCartDraft = {
      currency: 'EUR',
      country: 'DE',
      taxMode: 'Platform',
    };

    const response = await userApiClient
      .me()
      .carts()
      .post({
        body: cartDraft,
      })
      .execute();

    const cart = this.mapCartToData(response.body);
    this.currentCart = cart;
    this.notifyCartUpdate(cart);
    return cart;
  }

  private static async getOrCreateAnonymousCart(): Promise<CartData> {
    const anonymousCartId = localStorage.getItem('anonymousCartId');

    if (anonymousCartId) {
      try {
        const response = await apiRoot.carts().withId({ ID: anonymousCartId }).get().execute();

        const cart = this.mapCartToData(response.body);
        this.currentCart = cart;
        this.notifyCartUpdate(cart);
        return cart;
      } catch {
        localStorage.removeItem('anonymousCartId');
      }
    }

    return await this.createAnonymousCart();
  }

  private static async createAnonymousCart(): Promise<CartData> {
    const cartDraft: CartDraft = {
      currency: 'EUR',
      country: 'DE',
      taxMode: 'Disabled',
    };

    const response = await apiRoot
      .carts()
      .post({
        body: cartDraft,
      })
      .execute();

    const cart = this.mapCartToData(response.body);
    this.currentCart = cart;

    localStorage.setItem('anonymousCartId', cart.id);
    this.notifyCartUpdate(cart);
    return cart;
  }

  private static async addToUserCart(productId: string, quantity: number): Promise<CartData> {
    const cart = await this.getOrCreateCart();
    const userApiClient = AuthorizationService.getUserApiClient();
    if (!userApiClient) {
      throw new Error('Оўібка полученія API клиентпа пользователя');
    }

    const response = await userApiClient
      .me()
      .carts()
      .withId({ ID: cart.id })
      .post({
        body: {
          version: cart.version,
          actions: [
            {
              action: 'addLineItem',
              productId,
              quantity,
            },
          ],
        },
      })
      .execute();

    return this.mapCartToData(response.body);
  }

  private static async addToAnonymousCart(productId: string, quantity: number): Promise<CartData> {
    const cart = await this.getOrCreateCart();

    const response = await apiRoot
      .carts()
      .withId({ ID: cart.id })
      .post({
        body: {
          version: cart.version,
          actions: [
            {
              action: 'addLineItem',
              productId,
              quantity,
            },
          ],
        },
      })
      .execute();

    return this.mapCartToData(response.body);
  }

  private static mapCartToData(cart: Cart): CartData {
    const lineItems: CartLineItem[] = cart.lineItems.map((item: LineItem) => ({
      id: item.id,
      productId: item.productId,
      productKey: item.productKey,
      name: this.extractProductName(item),
      quantity: item.quantity,
      price: item.price.value.centAmount / 100,
      totalPrice: item.totalPrice.centAmount / 100,
      imageUrl: item.variant.images?.[0]?.url,
    }));

    const totalPrice = cart.totalPrice.centAmount / 100;
    const itemCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      version: cart.version,
      lineItems,
      totalPrice,
      currency: cart.totalPrice.currencyCode,
      itemCount,
    };
  }

  private static extractProductName(lineItem: LineItem): string {
    const name =
      lineItem.name?.['en-US'] ||
      lineItem.name?.['en'] ||
      lineItem.name?.['ru'] ||
      lineItem.name?.['de-DE'] ||
      Object.values(lineItem.name || {})[0];

    return name || 'Товар без названия';
  }
}
