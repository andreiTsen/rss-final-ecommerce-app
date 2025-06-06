import { apiRoot } from '../../api';
import { AuthService } from '../../services/authService';
import type { Customer } from '@commercetools/platform-sdk';
import type { UserData } from './sectionProfile';

export type customerData = Customer;


export async function updateProfileInfo(data: Partial<UserData>): Promise<Customer> {
  const current = AuthService.getCurrentUser();
  if (!current) throw new Error('Неавторизован');

  const response = await apiRoot
    .customers()
    .withId({ ID: current.id })
    .post({
      body: {
        version: current.version,
        actions: [
          { action: 'setFirstName', firstName: data.firstName },
          { action: 'setLastName', lastName: data.lastName },
          { action: 'changeEmail', email: data.email ?? '' },
          { action: 'setDateOfBirth', dateOfBirth: data.dateOfBirth },
        ],
      },
    })
    .execute();

  if (!response.body) {
    throw new Error('Ошибка обновления профиля в CTP');
  }
  AuthService.updateCurrentUser(response.body);
  return response.body;
}

export async function updateAddress(address: {
  id?: string;
  country: string;
  city: string;
  street: string;
  postalCode: string;
}): Promise<Customer> {
  const current = AuthService.getCurrentUser();
  if (!current) throw new Error('Неавторизован');

  const response = await apiRoot
    .customers()
    .withId({ ID: current.id })
    .post({
      body: {
        version: current.version,
        actions: [
          {
            action: 'changeAddress',
            addressId: address.id,
            address: {
              country: address.country,
              city: address.city,
              streetName: address.street,
              postalCode: address.postalCode,
            },
          },
        ],
      },
    })
    .execute();

  if (!response.body) {
    throw new Error('Ошибка обновления адреса в CTP');
  }
  AuthService.updateCurrentUser(response.body);
  return response.body;
}

export async function updatePassword(
  version: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean }> {
  const current = AuthService.getCurrentUser();
  const currentpwd = AuthService.getCurrentUser();
  console.log('updatePassword', currentPassword, newPassword, version, currentpwd);
  if (!current) throw new Error('Неавторизован');

  const response = await apiRoot
    .me()
    .password()
    .post({
      body: {
        version: version,
        currentPassword,
        newPassword,
      },
    })
    .execute();

  if (!response.body) throw new Error('Ошибка обновления пароля');
  AuthService.updateCurrentUser(response.body);
  return { success: true };
}
export async function updateDefaultShippingAddress(addressId: string): Promise<Customer> {
  const current = AuthService.getCurrentUser();

  if (!current) throw new Error('Неавторизован');

  const response = await apiRoot
    .customers()
    .withId({ ID: current.id })
    .post({
      body: {
        version: current.version,
        actions: [
          {
            action: 'setDefaultShippingAddress',
            addressId: addressId,
          },
        ],
      },
    })
    .execute();

  if (!response.body) {
    throw new Error('Ошибка обновления адреса доставки в CTP');
  }
  AuthService.updateCurrentUser(response.body);
  return response.body;
}
export async function addAddress(address: {
  id?: string;
  country: string;
  city: string;
  street: string;
  postalCode: string;
}): Promise<Customer> {
  const current = AuthService.getCurrentUser();
  if (!current) throw new Error('Неавторизован');
  console.log(current.version);
  const response = await apiRoot
    .customers()
    .withId({ ID: current.id })
    .post({
      body: {
        version: current.version,
        actions: [
          {
            action: 'addAddress',
            address: {
              id: address.id,
              country: address.country,
              city: address.city,
              streetName: address.street,
              postalCode: address.postalCode,
            },
          },
        ],
      },
    })
    .execute();

  if (!response.body) {
    throw new Error('Ошибка добавления адреса в CTP');
  }
  AuthService.updateCurrentUser(response.body);
  return response.body;
}
export default async function removeAddress(addressId: string): Promise<Customer> {
  const current = AuthService.getCurrentUser();
  if (!current) throw new Error('Неавторизован');

  const response = await apiRoot
    .customers()
    .withId({ ID: current.id })
    .post({
      body: {
        version: current.version,
        actions: [
          {
            action: 'removeAddress',
            addressId: addressId,
          },
        ],
      },
    })
    .execute();
  if (!response.body) {
    throw new Error('Ошибка удаления адреса в CTP');
  }
  AuthService.updateCurrentUser(response.body);
  return response.body;
}
export async function updateDefaultBillingAddress(addressId: string): Promise<Customer> {
  const current = AuthService.getCurrentUser();
  if (!current) throw new Error('Неавторизован');
  const response = await apiRoot
    .customers()
    .withId({ ID: current.id })
    .post({
      body: {
        version: current.version,
        actions: [
          {
            action: 'setDefaultBillingAddress',
            addressId: addressId,
          },
        ],
      },
    })
    .execute();
  if (!response.body) {
    throw new Error('Ошибка обновления адреса выставления счета в CTP');
  }
  AuthService.updateCurrentUser(response.body);
  return response.body;
}
