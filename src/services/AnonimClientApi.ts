import { ByProjectKeyRequestBuilder, createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { ClientBuilder } from '@commercetools/sdk-client-v2';
import type { AuthMiddlewareOptions, HttpMiddlewareOptions } from '@commercetools/sdk-client-v2';

const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: process.env.CT_API_URL || '',
  fetch,
};

const anonymousAuthMiddlewareOptions: AuthMiddlewareOptions = {
  host: process.env.CT_AUTH_URL || '',
  projectKey: process.env.CT_PROJECT_KEY || '',
  credentials: {
    clientId: process.env.CT_CLIENT_ID || '',
    clientSecret: process.env.CT_CLIENT_SECRET || '',
    anonymousId: process.env.CTP_ANONYMOUS_ID,
  },
  scopes: [`manage_project:${process.env.CT_PROJECT_KEY}`],
  fetch,
};

export function getAnonymousCartApiRoot(): ByProjectKeyRequestBuilder {
  const anonymousClient = new ClientBuilder()
    .withProjectKey(process.env.CT_PROJECT_KEY || '')
    .withAnonymousSessionFlow(anonymousAuthMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();

  return createApiBuilderFromCtpClient(anonymousClient).withProjectKey({
    projectKey: process.env.CT_PROJECT_KEY || '',
  });
}

export async function getAnonymousToken(): Promise<string> {
  const storedToken = localStorage.getItem('anonymous_token');
  if (storedToken) {
    return storedToken;
  }

  const authHeader = btoa(`${process.env.CT_CLIENT_ID}:${process.env.CT_CLIENT_SECRET}`);
  const response = await fetch(`${process.env.CT_AUTH_URL}oauth/${process.env.CT_PROJECT_KEY}/anonymous/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=anonymous',
  });

  if (!response.ok) {
    throw new Error('Failed to get anonymous token');
  }

  const data = await response.json();
  localStorage.setItem('anonymous_token', data.access_token);
  return data.access_token;
}
