import type { LoginCredentials } from '../../../features/auth-form';
import type { RegisterCredentials } from '../../../features/register-form';

export interface UseAuthResult {
  handleLogin: (credentials: LoginCredentials) => Promise<void>;
  handleRegister: (credentials: RegisterCredentials) => Promise<void>;
}

