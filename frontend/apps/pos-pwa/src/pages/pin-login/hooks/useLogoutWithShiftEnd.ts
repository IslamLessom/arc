import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@restaurant-pos/api-client';
import type { Account, AccountType } from '@restaurant-pos/types';

interface UseLogoutWithShiftEndProps {
  cashAccountId?: string;
  onLogoutComplete?: () => void;
}

// Локальный тип Shift, соответствующий API
interface Shift {
  id: string;
  user_id: string;
  establishment_id: string;
  start_time: string;
  end_time?: string;
  initial_cash: number;
  final_cash?: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

interface ActiveShiftResponse {
  data: Shift;
}

interface EndShiftRequest {
  shift_id: string;
  final_cash: number;
  leave_cash?: number;
  cash_account_id: string;
  comment?: string;
}

interface AccountsResponse {
  data: Account[];
}

interface AccountTypesResponse {
  data: AccountType[];
}

/**
 * Хук для выхода из системы с завершением активной смены
 * При клике на logout отправляет запросы на:
 * 1. GET /api/v1/shifts/me/active - проверка активной смены
 * 2. POST /api/v1/shifts/end - закрытие смены (если есть)
 *
 * @param cashAccountId - Опциональный ID наличного счёта. Если не указан,
 *                        будет выполнен поиск счёта с типом "cash" или "наличные"
 */
export function useLogoutWithShiftEnd(props: UseLogoutWithShiftEndProps = {}) {
  const { cashAccountId: propsCashAccountId, onLogoutComplete } = props;
  const navigate = useNavigate();
  const [isEndingShift, setIsEndingShift] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsEndingShift(true);

    try {
      // Шаг 1: Проверяем наличие активной смены
      let activeShift: Shift | null = null;

      try {
        const shiftResponse = await apiClient.get<ActiveShiftResponse>('/shifts/me/active');
        activeShift = shiftResponse.data.data;
        console.log('Найдена активная смена:', activeShift);
      } catch (error: unknown) {
        // 404 означает, что активной смены нет - это нормально
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            console.log('Активная смена не найдена');
          } else {
            console.error('Ошибка при проверке активной смены:', error);
          }
        } else {
          console.error('Ошибка при проверке активной смены:', error);
        }
      }

      // Шаг 2: Определяем ID наличного счёта
      let finalCashAccountId = propsCashAccountId;

      if (!finalCashAccountId && activeShift) {
        try {
          // Получаем типы счетов для поиска наличного
          const typesResponse = await apiClient.get<AccountTypesResponse>('/finance/account-types');
          const accountTypes = typesResponse.data.data;

          // Получаем активные счета
          const accountsResponse = await apiClient.get<AccountsResponse>('/finance/accounts?active=true');
          const accounts = accountsResponse.data.data;

          // Ищем счёт по типу
          const cashType = accountTypes.find(
            (t) => t.name.toLowerCase() === 'cash' || t.displayName.toLowerCase().includes('наличн')
          );

          if (cashType) {
            const cashAccount = accounts.find((a) => a.typeId === cashType.id && a.active);
            if (cashAccount) {
              finalCashAccountId = cashAccount.id;
            }
          }

          // Если не нашли по типу, ищем по названию счёта
          if (!finalCashAccountId) {
            const cashAccountByName = accounts.find(
              (a) => a.name.toLowerCase().includes('касса') || a.name.toLowerCase().includes('наличн')
            );
            if (cashAccountByName) {
              finalCashAccountId = cashAccountByName.id;
            }
          }

          // Последняя попытка - берём первый активный счёт
          if (!finalCashAccountId && accounts.length > 0) {
            const firstActiveAccount = accounts.find((a) => a.active);
            if (firstActiveAccount) {
              finalCashAccountId = firstActiveAccount.id;
            }
          }

          console.log('Определён наличный счёт:', finalCashAccountId);
        } catch (error) {
          console.error('Ошибка при поиске наличного счёта:', error);
        }
      }

      // Шаг 3: Если есть активная смена и найден наличный счёт - закрываем смену
      if (activeShift && finalCashAccountId) {
        try {
          const endShiftRequest: EndShiftRequest = {
            shift_id: activeShift.id,
            final_cash: activeShift.initial_cash,
            leave_cash: activeShift.initial_cash,
            cash_account_id: finalCashAccountId,
            comment: 'Смена завершена при выходе из системы',
          };

          console.log('Завершение смены:', endShiftRequest);
          await apiClient.post<ActiveShiftResponse>('/shifts/end', endShiftRequest);
          console.log('Смена успешно завершена');
        } catch (error) {
          console.error('Ошибка при завершении смены:', error);
          // Продолжаем выход даже при ошибке завершения смены
        }
      } else if (activeShift && !finalCashAccountId) {
        console.warn('Активная смена найдена, но не удалось определить наличный счёт. Смена не будет закрыта.');
      }

      // Шаг 4: Очищаем все данные из localStorage
      localStorage.clear();

      // Шаг 5: Вызываем callback если передан
      if (onLogoutComplete) {
        onLogoutComplete();
      }

      // Шаг 6: Переходим на страницу авторизации
      navigate('/auth');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);

      // При любой ошибке всё равно выходим
      localStorage.clear();
      navigate('/auth');
    } finally {
      setIsEndingShift(false);
    }
  }, [propsCashAccountId, navigate, onLogoutComplete]);

  return {
    handleLogout,
    isEndingShift,
  };
}
