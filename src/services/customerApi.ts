import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { ClientBuilder, type AuthMiddlewareOptions, type HttpMiddlewareOptions } from '@commercetools/sdk-client-v2';

const customerAuthMiddlewareOptions: AuthMiddlewareOptions = {
  host: process.env.CT_AUTH_URL || '',
  projectKey: process.env.CT_PROJECT_KEY || '',
  credentials: {
    clientId: process.env.CT_CLIENT_ID || '',
    clientSecret: process.env.CT_CLIENT_SECRET || '',
  },
  scopes: [
    `manage_customers:${process.env.CT_PROJECT_KEY}`,
    `view_published_products:${process.env.CT_PROJECT_KEY}`,
    `manage_my_profile:${process.env.CT_PROJECT_KEY}`,
    `view_orders:${process.env.CT_PROJECT_KEY}`,
    `view_categories:${process.env.CT_PROJECT_KEY}`,
  ],
  fetch,
};

const customerHttpMiddlewareOptions: HttpMiddlewareOptions = {
  host: process.env.CT_API_URL || '',
  fetch,
};

const customerClient = new ClientBuilder()
  .withProjectKey(process.env.CT_PROJECT_KEY || '')
  .withClientCredentialsFlow(customerAuthMiddlewareOptions)
  .withHttpMiddleware(customerHttpMiddlewareOptions)
  .build();

export const customerApiRoot = createApiBuilderFromCtpClient(customerClient).withProjectKey({
  projectKey: process.env.CT_PROJECT_KEY || '',
});
