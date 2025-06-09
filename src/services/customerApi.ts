import { ApiRoot, ByProjectKeyRequestBuilder, createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import {
  ClientBuilder,
  type PasswordAuthMiddlewareOptions,
  type HttpMiddlewareOptions,
  AuthMiddlewareOptions,
} from '@commercetools/sdk-client-v2';

const customerHttpMiddlewareOptions: HttpMiddlewareOptions = {
  host: process.env.CT_API_URL || '',
  fetch,
};

export function getCustomerApiRootWithPassword(email: string, password: string): ByProjectKeyRequestBuilder {
  const passwordAuthOptions: PasswordAuthMiddlewareOptions = {
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
      `manage_customers:${process.env.CT_PROJECT_KEY}`,
      `view_published_products:${process.env.CT_PROJECT_KEY}`,
      `manage_my_profile:${process.env.CT_PROJECT_KEY}`,
      `manage_my_orders:${process.env.CT_PROJECT_KEY}`,
      `view_orders:${process.env.CT_PROJECT_KEY}`,
      `view_categories:${process.env.CT_PROJECT_KEY}`,
      `create_anonymous_token:${process.env.CT_PROJECT_KEY}`,
    ],
    fetch,
  };

  const customerClient = new ClientBuilder()
    .withPasswordFlow(passwordAuthOptions)
    .withHttpMiddleware(customerHttpMiddlewareOptions)
    .build();

  return createApiBuilderFromCtpClient(customerClient).withProjectKey({
    projectKey: process.env.CT_PROJECT_KEY || '',
  });
}

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
    `manage_my_orders:${process.env.CT_PROJECT_KEY}`,
    `view_orders:${process.env.CT_PROJECT_KEY}`,
    `view_categories:${process.env.CT_PROJECT_KEY}`,
    `create_anonymous_token:${process.env.CT_PROJECT_KEY}`,
  ],
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
