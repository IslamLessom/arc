import { useCallback } from 'react';
import { useAuth as useAuthMutation, useRegister as useRegisterMutation } from '@restaurant-pos/api-client';
import type { UseAuthResult } from '../model/types';
import type { LoginCredentials } from '../../../features/auth-form';
import type { RegisterCredentials } from '../../../features/register-form';
import { saveUserData } from '../../../shared/hooks/useOnboardingStatus';

export function useAuth(): UseAuthResult {
  const authMutation = useAuthMutation();
  const registerMutation = useRegisterMutation();

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    const result = await authMutation.mutateAsync(credentials);

    // Сохраняем данные пользователя после успешной авторизации
    handleAuthSuccess(result.user);
  }, [authMutation]);

  const handleRegister = useCallback(async (credentials: RegisterCredentials) => {
    const result = await registerMutation.mutateAsync(credentials);

    // Сохраняем данные пользователя после успешной регистрации
    handleAuthSuccess(result.user);
  }, [registerMutation]);

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
