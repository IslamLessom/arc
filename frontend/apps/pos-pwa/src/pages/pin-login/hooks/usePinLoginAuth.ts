import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePinLogin as usePinLoginMutation, useCurrentUser } from '@restaurant-pos/api-client';

export function usePinLoginAuth() {
  const navigate = useNavigate();
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
        await mutation.mutateAsync({
          pin,
          initial_cash: 1000,
          establishment_id: establishmentId,
        });
        // После успешного входа по PIN перенаправляем на главную
        navigate('/');
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
    [mutation, navigate, currentUser]
  );

  return {
    mutate,
    isLoading: mutation.isPending || isUserLoading,
    error: error || (userError ? 'Не удалось загрузить данные пользователя' : null),
  };
}
