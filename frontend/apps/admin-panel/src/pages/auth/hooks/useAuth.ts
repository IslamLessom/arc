import { useCallback } from 'react';
import type { UseAuthResult } from '../model/types';
import type { LoginCredentials } from '../../../features/auth-form';
import type { RegisterCredentials } from '../../../features/register-form';
import { saveUserData } from '../../../shared/hooks/useOnboardingStatus';

export function useAuth(): UseAuthResult {
  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    // Логика авторизации обрабатывается в useAuthForm
    // Здесь просто заглушка для совместимости
    console.log('Login attempt:', credentials);
  }, []);

  const handleRegister = useCallback(async (credentials: RegisterCredentials) => {
    // Логика регистрации обрабатывается в useRegisterForm
    // Здесь просто заглушка для совместимости
    console.log('Register attempt:', credentials);
  }, []);

  return {
    handleLogin,
    handleRegister,
  };
}

// Функция для сохранения данных пользователя после авторизации
export function handleAuthSuccess(user: {
  id: string;
  email: string;
  name: string;
  onboarding_completed: boolean;
  establishment_id?: string;
}): void {
  saveUserData({
    id: user.id,
    email: user.email,
    name: user.name,
    onboarding_completed: user.onboarding_completed,
    establishment_id: user.establishment_id,
  });
}

