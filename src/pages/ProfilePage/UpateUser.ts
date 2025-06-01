import { apiRoot } from '../../api';
import { AuthService } from '../../services/authService';
import type { Customer } from '@commercetools/platform-sdk';
import type { UserData } from './sectionProfile';

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
export async function updatePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean }> {
  const response = await fetch('/api/profile/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!response.ok) throw new Error('Ошибка обновления пароля');
  return response.json();
}
