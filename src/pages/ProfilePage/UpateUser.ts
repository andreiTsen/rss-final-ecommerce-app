import { apiRoot } from '../../api';
import { AuthService } from '../../services/authService';
import type { Customer } from '@commercetools/platform-sdk';
import type { UserData } from './sectionProfile';

/**
 * Обновляем профиль текущего пользователя через commercetools
 */
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
          { action: 'setLastName',  lastName:  data.lastName },
          { action: 'changeEmail',  email:     data.email ?? '' },
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

export async function updateAddress(address: { street: string; city: string; country: string; postalCode: string }): Promise<{ success: boolean }> {
  const response = await fetch('/api/profile/address', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
  if (!response.ok) throw new Error('Ошибка обновления адреса');
  return response.json();
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