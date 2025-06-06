import { AuthorizationService } from './authentication';

export class AuthService {
  public static async login(email: string, password: string): Promise<boolean> {
    return AuthorizationService.login(email, password);
  }
}
