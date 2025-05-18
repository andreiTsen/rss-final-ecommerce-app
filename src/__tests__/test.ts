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
    expect(result.message).toBe('Password can be contains uppercase letter');
  });
  it('should password one lowercase symbol', () => {
    const result = validatePassword('PASSWORD123!');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Password can be contains lowercase letter');
  });
  it('should password contains one digit', () => {
    const result = validatePassword('passWord');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Password can be contains one digit');
  });
  it('should password without trims', () => {
    const result = validatePassword('passWord!!1');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
  it('should password with trims', () => {
    const result = validatePassword('pass Word!!1');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please delete trims!');
  });
  it('should short password', () => {
    const result = validatePassword('Pass1!');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Password must be at least 8 characters long');
  });
});

describe('Validate email', () => {
  it('should email contains domain name after @', () => {
    const result = validateEmail('alex1234@');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Adress email must contains domain name after @');
  });
  it('should email contains domain name after @', () => {
    const result = validateEmail('alex1234@mail.ru');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
  it('should email contains trims', () => {
    const result = validateEmail('alex1234 mail.ru');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please delete trims!');
  });
  it('should email without trims', () => {
    const result = validateEmail('aleax1234@mail.ru');
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
  it('should email incorrect format', () => {
    const result = validateEmail('aleax');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Please enter '@' between part and domain name");
  });
});
