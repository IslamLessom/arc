import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@restaurant-pos/api-client';
import { saveUserData } from '../../../shared/hooks/useOnboardingStatus';
import type { UseAuthFormResult, AuthFormProps } from '../model/types';

export function useAuthForm(props: AuthFormProps): UseAuthFormResult {
  const { onSubmit } = props;
  const authMutation = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setError(null);
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!email.trim() || !password.trim()) {
        setError('Заполните все поля');
        return;
      }

      try {
        const response = await authMutation.mutateAsync({
          email: email.trim(),
          password,
        });

        // Сохраняем данные пользователя
        if (response.user) {
          saveUserData({
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            onboarding_completed: response.user.onboarding_completed,
            establishment_id: response.user.establishment_id,
          });
        }

        // Вызываем callback если он передан
        if (onSubmit) {
          await onSubmit({
            email: email.trim(),
            password,
          });
        }

        // Перенаправление на главную страницу
        navigate('/');
      } catch (err: unknown) {
        let errorMessage = 'Неверный email или пароль';
        
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { error?: string } } };
          if (axiosError.response?.data?.error) {
            errorMessage = axiosError.response.data.error;
          } else if (axiosError.response?.data && typeof axiosError.response.data === 'string') {
            errorMessage = axiosError.response.data;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      }
    },
    [email, password, authMutation, onSubmit]
  );

  return {
    email,
    password,
    isLoading: authMutation.isPending,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  };
}

