import {
  Cart,
  LineItem,
  MyCartDraft,
  Product,
  MyCartUpdateAction,
  ByProjectKeyRequestBuilder,
} from '@commercetools/platform-sdk';
import { apiRoot } from '../api';
import { AuthorizationService } from './authentication';
import { getCustomerApiRootWithPassword } from './customerApi';

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
  private static userApiClient: ByProjectKeyRequestBuilder | null = null;
  private static anonymousApiClient: ByProjectKeyRequestBuilder | null = null;

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
      const cart = await this.getOrCreateCart();
      const isAuthenticated = AuthorizationService.isAuthenticated();

      const updateAction: MyCartUpdateAction = {
        action: 'addLineItem',
        productId,
        quantity,
      };

      const response = await this.executeCartUpdate(cart, updateAction, isAuthenticated);
      const updatedCart = this.mapCartToData(response.body);
      this.currentCart = updatedCart;
      this.notifyCartUpdate(updatedCart);

      return updatedCart;
    } catch (error: unknown) {
      return await this.handleAddToCartError(error, productId, quantity);
    }
  }

  public static async removeProductFromCart(lineItemId: string): Promise<CartData> {
    try {
      const cart = await this.getOrCreateCart();
      const apiClient = this.getCartApiClient();

      const updateAction: MyCartUpdateAction = {
        action: 'removeLineItem',
        lineItemId,
      };

      const response = await apiClient
        .me()
        .carts()
        .withId({ ID: cart.id })
        .post({
          body: {
            version: cart.version,
            actions: [updateAction],
          },
        })
        .execute();

      const updatedCart = this.mapCartToData(response.body);
      this.currentCart = updatedCart;
      this.notifyCartUpdate(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Ошібка удаления товара', error);
      throw error;
    }
  }

  public static async updateProductQuantity(lineItemId: string, quantity: number): Promise<CartData> {
    try {
      const cart = await this.getOrCreateCart();
      const apiClient = this.getCartApiClient();

      const updateAction: MyCartUpdateAction = {
        action: 'changeLineItemQuantity',
        lineItemId,
        quantity,
      };

      const response = await apiClient
        .me()
        .carts()
        .withId({ ID: cart.id })
        .post({
          body: {
            version: cart.version,
            actions: [updateAction],
          },
        })
        .execute();

      const updatedCart = this.mapCartToData(response.body);
      this.currentCart = updatedCart;
      this.notifyCartUpdate(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Ошибка изменения кол-ва товара:', error);
      throw error;
    }
  }

  public static async clearCart(): Promise<CartData> {
    try {
      const cart = await this.getOrCreateCart();

      if (cart.lineItems.length === 0) {
        return cart;
      }

      const apiClient = this.getCartApiClient();
      const actions: MyCartUpdateAction[] = cart.lineItems.map((item) => ({
        action: 'removeLineItem',
        lineItemId: item.id,
      }));

      const response = await apiClient
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

      const updatedCart = this.mapCartToData(response.body);
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
    this.userApiClient = null;
    this.anonymousApiClient = null;
    this.resetCallbacks();
  }

  public static getCurrentCart(): CartData | null {
    return this.currentCart;
  }

  private static isCommerceToolsError(
    error: unknown
  ): error is { body: unknown; statusCode?: number; message?: string } {
    return typeof error === 'object' && error !== null && 'body' in error;
  }

  private static async executeCartUpdate(
    cart: CartData,
    updateAction: MyCartUpdateAction,
    isAuthenticated: boolean
  ): Promise<{ body: Cart }> {
    if (isAuthenticated) {
      const apiClient = this.getCartApiClient();
      return await apiClient
        .me()
        .carts()
        .withId({ ID: cart.id })
        .post({
          body: {
            version: cart.version,
            actions: [updateAction],
          },
        })
        .execute();
    } else {
      return await apiRoot
        .carts()
        .withId({ ID: cart.id })
        .post({
          body: {
            version: cart.version,
            actions: [updateAction],
          },
        })
        .execute();
    }
  }

  private static async handleAddToCartError(error: unknown, productId: string, quantity: number): Promise<CartData> {
    console.error('Ошибка добавления в корзину:', error);

    if (this.isCommerceToolsError(error)) {
      console.error('Детали:', error.body);

      if (error.statusCode === 409) {
        console.warn('Конфлікт версий корзины, обновленіе...');
        this.currentCart = null;
        return await this.addProductToCart(productId, quantity);
      }
    }

    throw error;
  }

  private static getCartApiClient(): ByProjectKeyRequestBuilder {
    const isAuthenticated = AuthorizationService.isAuthenticated();

    if (isAuthenticated) {
      if (!this.userApiClient) {
        const userData = this.getUserCredentials();
        if (userData) {
          this.userApiClient = getCustomerApiRootWithPassword(userData.email, userData.password);
        } else {
          throw new Error('Не найдены учетные данные авторизованного пользователя');
        }
      }
      return this.userApiClient;
    } else {
      return apiRoot;
    }
  }

  private static getUserCredentials(): { email: string; password: string } | null {
    try {
      const currentUser = AuthorizationService.getCurrentUser();
      if (currentUser && currentUser.email && currentUser.password) {
        return { email: currentUser.email, password: currentUser.password };
      }

      const savedCredentials = localStorage.getItem('userCredentials');
      if (savedCredentials) {
        const credentials = JSON.parse(savedCredentials);
        if (credentials.email && credentials.password) {
          return credentials;
        }
      }

      console.warn('Нет данных юзера');
      return null;
    } catch (error) {
      console.error('Ошібка данных юзера:', error);
      return null;
    }
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

    try {
      if (isAuthenticated) {
        const apiClient = this.getCartApiClient();
        const response = await apiClient.me().activeCart().get().execute();
        const cart = this.mapCartToData(response.body);
        this.currentCart = cart;
        this.notifyCartUpdate(cart);
        return cart;
      } else {
        const anonymousCartId = localStorage.getItem('anonymousCartId');

        if (anonymousCartId) {
          try {
            const response = await apiRoot.carts().withId({ ID: anonymousCartId }).get().execute();
            const cart = this.mapCartToData(response.body);
            this.currentCart = cart;
            this.notifyCartUpdate(cart);
            return cart;
          } catch (error) {
            console.warn('Анонимная корзины нет, создаем новую', error);
            localStorage.removeItem('anonymousCartId');
          }
        }

        return await this.createNewCart(false);
      }
    } catch (error) {
      console.warn('Нет активной корзины, создаем новую', error);
      return await this.createNewCart(isAuthenticated);
    }
  }

  private static async createNewCart(isAuthenticated: boolean): Promise<CartData> {
    try {
      if (isAuthenticated) {
        const apiClient = this.getCartApiClient();
        const cartDraft: MyCartDraft = {
          currency: 'EUR',
          country: 'DE',
          taxMode: 'Disabled',
        };

        const response = await apiClient.me().carts().post({ body: cartDraft }).execute();
        const cart = this.mapCartToData(response.body);
        this.currentCart = cart;
        this.notifyCartUpdate(cart);
        return cart;
      } else {
        const response = await apiRoot
          .carts()
          .post({
            body: {
              currency: 'EUR',
              country: 'DE',
              taxMode: 'Disabled',
            },
          })
          .execute();

        const cart = this.mapCartToData(response.body);
        this.currentCart = cart;
        localStorage.setItem('anonymousCartId', cart.id);
        this.notifyCartUpdate(cart);
        return cart;
      }
    } catch (error) {
      console.error('Ошибка создания корзины:', error);
      throw error;
    }
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
        console.error(`Ошібка callback ${index + 1}:`, error);
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
      console.error('Ошибка налоговов:', error);
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
