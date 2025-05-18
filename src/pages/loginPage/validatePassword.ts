export type passwordValidationResult = {
  isValid: boolean;
  message: string;
};

export default function validatePassword(value: string): passwordValidationResult {
  const validFormat = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[\S]{8,}/;
  const uppercase = /(?=.*[A-Z])/;
  const lowercase = /(?=.*[a-z])/;
  const digit = /(?=.*\d)/;
  const whitespace = /\s+/;
  if (!validFormat.test(value)) {
    if (!uppercase.test(value)) {
      return { isValid: false, message: 'Пароль должен содержать буквы в верхнем регистре.' };
    }
    if (!lowercase.test(value)) {
      return { isValid: false, message: 'Пароль должен содержать буквы в нижнем регистре.' };
    }
    if (!digit.test(value)) {
      return { isValid: false, message: 'Пароль должен содержать хотя бы одну цифру!' };
    }
    if (whitespace.test(value)) {
      return { isValid: false, message: 'Удалите отступ!' };
    }
    if (value.length < 8) {
      return { isValid: false, message: 'Пароль должен содержать не менее 8 символов.' };
    }
    if (!value) {
      return { isValid: false, message: 'Введите пароль!' };
    }
    return { isValid: false, message: 'Неверный формат пароля!' };
  }

  return { isValid: true, message: '' };
}
