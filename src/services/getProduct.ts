import { ProductProjection } from '@commercetools/platform-sdk';
import { customerApiRoot } from './customerApi';

export async function getProduct(key: string): Promise<ProductProjection | undefined> {
  try {
    const api = await customerApiRoot.productProjections().withKey({ key }).get().execute();
    return api.body;
  } catch (error) {
    console.error(error);
  }
}
