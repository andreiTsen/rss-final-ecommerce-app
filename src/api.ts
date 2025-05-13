import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { ClientBuilder, type AuthMiddlewareOptions, type HttpMiddlewareOptions } from '@commercetools/sdk-client-v2';

export const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: process.env.CT_AUTH_URL || '',
  projectKey: process.env.CT_PROJECT_KEY || '',
  credentials: {
    clientId: process.env.CT_CLIENT_ID || '',
    clientSecret: process.env.CT_CLIENT_SECRET || '',
  },
  scopes: [
    // `manage_products:${process.env.CT_PROJECT_KEY}`,
    // `manage_categories:${process.env.CT_PROJECT_KEY}`,
    // `manage_customers:${process.env.CT_PROJECT_KEY}`,
    // `manage_orders:${process.env.CT_PROJECT_KEY}`,
    // `manage_cart_discounts:${process.env.CT_PROJECT_KEY}`,
    // `manage_shopping_lists:${process.env.CT_PROJECT_KEY}`,
    // `manage_my_profile:${process.env.CT_PROJECT_KEY}`,
    `manage_project:${process.env.CT_PROJECT_KEY}`
  ],
  fetch,
};

export const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: process.env.CT_API_URL || '',
  fetch,
};

const client = new ClientBuilder()
  .withProjectKey(process.env.CT_PROJECT_KEY || '')
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  .build();

export const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
  projectKey: process.env.CT_PROJECT_KEY || '',
});
