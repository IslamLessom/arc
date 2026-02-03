import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePinLogin as usePinLoginMutation, useCurrentUser } from '@restaurant-pos/api-client';

export interface UsePinLoginAuthOptions {
  onNoActiveShift?: () => void;
}

export function usePinLoginAuth(options?: UsePinLoginAuthOptions) {
  const { onNoActiveShift } = options || {};
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = usePinLoginMutation();
  const { data: currentUser, isLoading: isUserLoading, error: userError } = useCurrentUser();
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (pin: string) => {
      setError(null);

      const establishmentId = currentUser?.establishment_id;

      if (!establishmentId) {
        setError('Заведение не найдено. Пожалуйста, войдите снова.');
        throw new Error('No establishment_id found');
      }

      try {
        // Логинимся без initial_cash, так как пользователь введет его в модалке
        await mutation.mutateAsync({
          pin,
          establishment_id: establishmentId,
        });

        // Удаляем флаг блокировки после успешного входа
        localStorage.removeItem('is_locked');

        // После успешного входа сбрасываем кеш, чтобы загрузить актуальные данные
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['shifts'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['tables'] });

        // После успешного входа по PIN проверяем активную смену
        // Небольшая задержка, чтобы токен успел сохраниться
        await new Promise(resolve => setTimeout(resolve, 100));

        // Проверяем активную смену
        try {
          const shiftResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/shifts/me/active`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });

          if (shiftResponse.status === 404) {
            // Активной смены нет - показываем модалку
            if (onNoActiveShift) {
              onNoActiveShift();
            }
            return;
          }

          if (shiftResponse.ok) {
            // Активная смена есть - перенаправляем на главную
            navigate('/');
          } else {
            // Ошибка при проверке смены - всё равно перенаправляем
            navigate('/');
          }
        } catch (shiftError) {
          // При ошибке проверки смены - перенаправляем на главную
          console.error('Ошибка при проверке активной смены:', shiftError);
          navigate('/');
        }
      } catch (err: unknown) {
        let errorMessage = 'Неверный PIN-код';

        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
          if (axiosError.response?.data?.error) {
            errorMessage = axiosError.response.data.error;
          } else if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        throw err;
      }
    },
    [mutation, navigate, currentUser, onNoActiveShift, queryClient]
  );

  return {
    mutate,
    isLoading: mutation.isPending || isUserLoading,
    error: error || (userError ? 'Не удалось загрузить данные пользователя' : null),
  };
}
