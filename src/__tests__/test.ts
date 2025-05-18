import validatePassword from '../pages/loginPage/validatePassword';
import validateEmail from '../pages/loginPage/validateEmail';

describe('ValidatePassword', () => {
  it('should return valid password', () => {
    const result = validatePassword('goodValidPassword111');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
  it('should password one uppercase symbol', () => {
    const result = validatePassword('password123!');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Пароль должен содержать буквы в верхнем регистре.');
  });
  it('should password one lowercase symbol', () => {
    const result = validatePassword('PASSWORD123!');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Пароль должен содержать буквы в нижнем регистре.');
  });
  it('should password contains one digit', () => {
    const result = validatePassword('passWord');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Пароль должен содержать хотя бы одну цифру!');
  });
  it('should password without trims', () => {
    const result = validatePassword('passWord!!1');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
  it('should password with trims', () => {
    const result = validatePassword('pass Word!!1');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Удалите отступ!');
  });
  it('should short password', () => {
    const result = validatePassword('Pass1!');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Пароль должен содержать не менее 8 символов.');
  });
});

describe('Validate email', () => {
  it('should email contains domain name after @', () => {
    const result = validateEmail('alex1234@');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Адрес почты должен содержать перед доменным именем @');
  });
  it('should email contains domain name after @', () => {
    const result = validateEmail('alex1234@mail.ru');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
  it('should email contains trims', () => {
    const result = validateEmail('alex1234 mail.ru');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Пожалуйста удалите пробелы!');
  });
  it('should email without trims', () => {
    const result = validateEmail('aleax1234@mail.ru');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
  it('should email incorrect format', () => {
    const result = validateEmail('aleax');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Пожалуйста вставьте '@' между именем почты и доменным именем.");
  });
});
