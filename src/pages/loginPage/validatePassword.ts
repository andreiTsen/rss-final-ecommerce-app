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
      return { isValid: false, message: 'Password can be contains uppercase letter' };
    }
    if (!lowercase.test(value)) {
      return { isValid: false, message: 'Password can be contains lowercase letter' };
    }
    if (!digit.test(value)) {
      return { isValid: false, message: 'Password can be contains one digit' };
    }
    if (whitespace.test(value)) {
      return { isValid: false, message: 'Please delete trims!' };
    }
    if (value.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!value) {
      return { isValid: false, message: 'Please write password!' };
    }
    return { isValid: false, message: 'Incorrect password format!' };
  }

  return { isValid: true, message: '' };
}
