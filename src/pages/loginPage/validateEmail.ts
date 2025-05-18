export type emailValidationResult = {
  isValid: boolean;
  message: string;
};

export default function validateEmail(value: string): emailValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const domainName = /^((([0-9A-Za-z]{1}[-0-9A-z]{1,}[0-9A-Za-z]{1})|([0-9A-Za-z]{1,}))@)$/;
  const charAt = /^((([0-9A-Za-z]{1}[-0-9A-z]{1,}[0-9A-Za-z]{1})|([0-9A-Za-z]{1,})))$/;
  const whitespace = /\s+/;

  if (!emailRegex.test(String(value))) {
    if (domainName.test(String(value))) {
      return { isValid: false, message: 'Адрес почты должен содержать перед доменным именем @' };
    }

    if (charAt.test(String(value))) {
      return { isValid: false, message: "Пожалуйста вставьте '@' между именем почты и доменным именем." };
    }
    if (whitespace.test(String(value))) {
      return { isValid: false, message: 'Пожалуйста удалите пробелы!' };
    }
    if (!value) {
      return { isValid: false, message: 'Пожалуйста введите почту!' };
    }
    return { isValid: false, message: 'Неверный формат почты!' };
  }

  return { isValid: true, message: '' };
}
