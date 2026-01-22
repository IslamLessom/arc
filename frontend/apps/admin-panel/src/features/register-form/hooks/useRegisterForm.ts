import { useState, useCallback } from 'react';
import { useRegister } from '@restaurant-pos/api-client';
import { saveUserData } from '../../../shared/hooks/useOnboardingStatus';
import type { UseRegisterFormResult, RegisterFormProps } from '../model/types';

export function useRegisterForm(props: RegisterFormProps): UseRegisterFormResult {
  const { onSubmit } = props;
  const registerMutation = useRegister();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setError(null);
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setError(null);
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!email.trim() || !password.trim() || !name.trim()) {
        setError('Заполните все поля');
        return;
      }

      if (password.length < 6) {
        setError('Пароль должен содержать минимум 6 символов');
        return;
      }

      try {
        const response = await registerMutation.mutateAsync({
          email: email.trim(),
          password,
          name: name.trim(),
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
            name: name.trim(),
          });
        }

        // Перенаправление на главную страницу
        window.location.href = '/';
      } catch (err: unknown) {
        let errorMessage = 'Ошибка при регистрации';
        
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
    [email, password, name, registerMutation, onSubmit]
  );

  return {
    email,
    password,
    name,
    isLoading: registerMutation.isPending,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleNameChange,
    handleSubmit,
  };
}

