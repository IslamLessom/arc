import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStartShift } from '@restaurant-pos/api-client';
import * as Styled from './styled';

export interface ShiftStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShiftStartModal({ isOpen, onClose, onSuccess }: ShiftStartModalProps) {
  const [initialCash, setInitialCash] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const startShift = useStartShift();

  // Форматирование времени открытия
  const openTime = useMemo(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return now.toLocaleString('ru-RU', options);
  }, []);

  // Сброс состояния при открытии и загрузка сохраненной суммы
  useEffect(() => {
    if (isOpen) {
      // Проверяем есть ли сохраненная сумма от предыдущей смены
      const nextShiftCash = localStorage.getItem('next_shift_initial_cash')
      if (nextShiftCash) {
        setInitialCash(nextShiftCash)
        // Удаляем после использования
        localStorage.removeItem('next_shift_initial_cash')
      } else {
        setInitialCash('')
      }
      setError(null)
    }
  }, [isOpen])

  const handleClose = () => {
    setInitialCash('');
    setError(null);
    onClose();
  };

  const handleOpenShift = async () => {
    setError(null);

    // Валидация
    const cashValue = parseFloat(initialCash.replace(',', '.').replace(/\s/g, ''));
    if (isNaN(cashValue) || initialCash.trim() === '') {
      setError('Пожалуйста, введите корректную сумму');
      return;
    }

    if (cashValue < 0) {
      setError('Сумма не может быть отрицательной');
      return;
    }

    try {
      await startShift.mutateAsync({ initial_cash: cashValue });
      // Сбрасываем кеш после успешного открытия смены
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      onSuccess();
    } catch (err: unknown) {
      let errorMessage = 'Не удалось открыть смену. Попробуйте снова.';

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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем ввод цифр, одной запятой или точки, и пробелов для разделения тысяч
    const regex = /^[0-9.,\s]*$/;
    if (regex.test(value)) {
      setInitialCash(value);
      setError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && initialCash.trim() !== '' && !startShift.isPending) {
      handleOpenShift();
    }
  };

  if (!isOpen) return null;

  const isOpenDisabled = initialCash.trim() === '' || startShift.isPending;

  return (
    <Styled.ModalOverlay onClick={handleClose}>
      <Styled.ModalContent onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.NavItem>Функции</Styled.NavItem>
          <Styled.ModalTitle>Открытие кассовой смены</Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>&times;</Styled.CloseButton>
        </Styled.ModalHeader>

        <Styled.ModalBody>
          <Styled.InfoBlock>
            <Styled.FlagIcon>🏁</Styled.FlagIcon>
            <Styled.InfoText>
              Чтобы контролировать движение денег в кассе, пересчитайте наличные в денежном ящике и откройте кассовую смену
            </Styled.InfoText>
          </Styled.InfoBlock>

          <Styled.InputWrapper>
            <Styled.InputLabel>Остаток в кассе</Styled.InputLabel>
            <Styled.CashInput
              type="text"
              value={initialCash}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="0.00"
              disabled={startShift.isPending}
              autoFocus
            />
            {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}
          </Styled.InputWrapper>

          <Styled.TimeInfo>Время открытия: {openTime}</Styled.TimeInfo>
        </Styled.ModalBody>

        <Styled.ModalFooter>
          <Styled.OpenButton
            onClick={handleOpenShift}
            disabled={isOpenDisabled}
          >
            {startShift.isPending ? 'Открытие...' : 'Открыть'}
          </Styled.OpenButton>
        </Styled.ModalFooter>
      </Styled.ModalContent>
    </Styled.ModalOverlay>
  );
}

export default ShiftStartModal;
