import { createApiBuilderFromCtpClient, ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';
import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
  type PasswordAuthMiddlewareOptions,
} from '@commercetools/sdk-client-v2';

export const adminAuthMiddlewareOptions: AuthMiddlewareOptions = {
  host: process.env.CT_AUTH_URL || '',
  projectKey: process.env.CT_PROJECT_KEY || '',
  credentials: {
    clientId: process.env.CT_CLIENT_ID || '',
    clientSecret: process.env.CT_CLIENT_SECRET || '',
  },
  scopes: [
    `manage_customers:${process.env.CT_PROJECT_KEY}`,
    `manage_products:${process.env.CT_PROJECT_KEY}`,
    `manage_categories:${process.env.CT_PROJECT_KEY}`,
    `manage_orders:${process.env.CT_PROJECT_KEY}`,
    `manage_cart_discounts:${process.env.CT_PROJECT_KEY}`,
    `manage_shopping_lists:${process.env.CT_PROJECT_KEY}`,
    `manage_project:${process.env.CT_PROJECT_KEY}`,
    `view_published_products:${process.env.CT_PROJECT_KEY}`,
    `view_categories:${process.env.CT_PROJECT_KEY}`,
  ],
  fetch,
};

export const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: process.env.CT_API_URL || '',
  fetch,
};

const adminClient = new ClientBuilder()
  .withProjectKey(process.env.CT_PROJECT_KEY || '')
  .withClientCredentialsFlow(adminAuthMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  .build();

export const adminApiRoot = createApiBuilderFromCtpClient(adminClient).withProjectKey({
  projectKey: process.env.CT_PROJECT_KEY || '',
});

export function createUserApiClient(email: string, password: string): ByProjectKeyRequestBuilder {
  const userAuthMiddlewareOptions: PasswordAuthMiddlewareOptions = {
    host: process.env.CT_AUTH_URL || '',
    projectKey: process.env.CT_PROJECT_KEY || '',
    credentials: {
      clientId: process.env.CT_CLIENT_ID || '',
      clientSecret: process.env.CT_CLIENT_SECRET || '',
      user: {
        username: email,
        password: password,
      },
    },
    scopes: [
      `manage_my_profile:${process.env.CT_PROJECT_KEY}`,
      `manage_my_orders:${process.env.CT_PROJECT_KEY}`,
      `manage_my_shopping_lists:${process.env.CT_PROJECT_KEY}`,
      `view_published_products:${process.env.CT_PROJECT_KEY}`,
      `view_categories:${process.env.CT_PROJECT_KEY}`,
    ],
    fetch,
  };

  const userClient = new ClientBuilder()
    .withProjectKey(process.env.CT_PROJECT_KEY || '')
    .withPasswordFlow(userAuthMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();

  return createApiBuilderFromCtpClient(userClient).withProjectKey({
    projectKey: process.env.CT_PROJECT_KEY || '',
  });
}
