import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useGetActiveShift, useEndShift, useGetAccounts, useGetAccountTypes } from '@restaurant-pos/api-client'
import * as Styled from './styled'

export interface ShiftMenuModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShiftMenuModal({ isOpen, onClose }: ShiftMenuModalProps) {
  const [finalCash, setFinalCash] = useState('')
  const [leaveInCash, setLeaveInCash] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showEndShift, setShowEndShift] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: activeShift, isLoading } = useGetActiveShift()
  const endShift = useEndShift()

  // Получаем типы счетов чтобы найти "наличные"
  const { data: accountTypes } = useGetAccountTypes()
  const cashAccountType = accountTypes?.find(type => type.name.toLowerCase() === 'наличные')

  // Получаем наличные счета
  const { data: cashAccounts = [] } = useGetAccounts(cashAccountType?.id, true)

  // Автоматически выбираем "Денежный ящик" при загрузке счетов
  useEffect(() => {
    if (cashAccounts.length > 0 && !selectedAccountId) {
      const cashDrawer = cashAccounts.find(acc => acc.name === 'Денежный ящик')
      setSelectedAccountId(cashDrawer?.id || cashAccounts[0].id)
    }
  }, [cashAccounts, selectedAccountId])

  const handleClose = () => {
    setFinalCash('')
    setLeaveInCash('')
    setError(null)
    setShowEndShift(false)
    onClose()
  }

  const handleEndShift = async () => {
    setError(null)

    if (!activeShift) {
      setError('Нет активной смены')
      return
    }

    if (!selectedAccountId) {
      setError('Не выбран денежный ящик')
      return
    }

    const cashValue = parseFloat(finalCash.replace(',', '.').replace(/\s/g, ''))
    if (isNaN(cashValue) || finalCash.trim() === '') {
      setError('Пожалуйста, введите корректную сумму')
      return
    }

    if (cashValue < 0) {
      setError('Сумма не может быть отрицательной')
      return
    }

    try {
      // Рассчитываем сколько оставить в кассе
      let leaveAmount = 0
      if (leaveInCash.trim() !== '') {
        leaveAmount = parseFloat(leaveInCash.replace(',', '.').replace(/\s/g, ''))
        if (isNaN(leaveAmount) || leaveAmount < 0) {
          setError('Пожалуйста, введите корректную сумму для оставления в кассе')
          return
        }
      } else {
        // По умолчанию оставляем все что есть
        leaveAmount = cashValue
      }

      // Сохраняем сумму для следующей смены
      localStorage.setItem('next_shift_initial_cash', leaveAmount.toString())

      await endShift.mutateAsync({
        shift_id: activeShift.id,
        final_cash: cashValue,
        cash_account_id: selectedAccountId,
      })

      // Восстанавливаем токены владельца из бэкапа
      const ownerTokenBackup = localStorage.getItem('owner_token_backup')
      const ownerRefreshTokenBackup = localStorage.getItem('owner_refresh_token_backup')

      if (ownerTokenBackup && ownerRefreshTokenBackup) {
        // Восстанавливаем токены владельца
        localStorage.setItem('auth_token', ownerTokenBackup)
        localStorage.setItem('refresh_token', ownerRefreshTokenBackup)
        localStorage.setItem('user_type', 'owner')
      } else {
        // Если нет бэкапа - очищаем всё
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_type')
      }

      // Удаляем бэкапы и employee токены
      localStorage.removeItem('owner_token_backup')
      localStorage.removeItem('owner_refresh_token_backup')

      // Очищаем кеш
      queryClient.clear()

      // Перенаправляем на pin-login
      navigate('/pin-login')
    } catch (err: unknown) {
      let errorMessage = 'Не удалось закрыть смену. Попробуйте снова.'

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } }
        if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const regex = /^[0-9.,\s]*$/
    if (regex.test(value)) {
      setFinalCash(value)
      setError(null)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2).replace('.', ',')} ₽`
  }

  const calculateDuration = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}ч ${minutes}м`
  }

  if (!isOpen) return null

  return (
    <Styled.ModalOverlay onClick={handleClose}>
      <Styled.ModalContent onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.NavItem>Функции</Styled.NavItem>
          <Styled.ModalTitle>
            {showEndShift ? 'Закрытие кассовой смены' : 'Меню смены'}
          </Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>&times;</Styled.CloseButton>
        </Styled.ModalHeader>

        <Styled.ModalBody>
          {showEndShift ? (
            <>
              <Styled.InfoBlock>
                <Styled.InfoIcon>ℹ️</Styled.InfoIcon>
                <Styled.InfoText>
                  Пересчитайте наличные в денежном ящике и введите сумму для закрытия смены
                </Styled.InfoText>
              </Styled.InfoBlock>

              {activeShift && (
                <Styled.ShiftInfo>
                  <Styled.ShiftInfoItem>
                    <Styled.ShiftInfoLabel>Открыта:</Styled.ShiftInfoLabel>
                    <Styled.ShiftInfoValue>{formatDateTime(activeShift.start_time)}</Styled.ShiftInfoValue>
                  </Styled.ShiftInfoItem>
                  <Styled.ShiftInfoItem>
                    <Styled.ShiftInfoLabel>Длительность:</Styled.ShiftInfoLabel>
                    <Styled.ShiftInfoValue>{calculateDuration(activeShift.start_time)}</Styled.ShiftInfoValue>
                  </Styled.ShiftInfoItem>
                  <Styled.ShiftInfoItem>
                    <Styled.ShiftInfoLabel>На начало:</Styled.ShiftInfoLabel>
                    <Styled.ShiftInfoValue>{formatPrice(activeShift.initial_cash)}</Styled.ShiftInfoValue>
                  </Styled.ShiftInfoItem>
                </Styled.ShiftInfo>
              )}

              {cashAccounts.length > 1 && (
                <Styled.InputWrapper>
                  <Styled.InputLabel>Денежный ящик</Styled.InputLabel>
                  <Styled.Select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    disabled={endShift.isPending}
                  >
                    {cashAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </Styled.Select>
                </Styled.InputWrapper>
              )}

              <Styled.InputWrapper>
                <Styled.InputLabel>Итоговая сумма в кассе</Styled.InputLabel>
                <Styled.CashInput
                  type="text"
                  value={finalCash}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={endShift.isPending}
                  autoFocus
                />
                {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}
              </Styled.InputWrapper>

              <Styled.InputWrapper>
                <Styled.InputLabel>Оставить в кассе (для следующей смены)</Styled.InputLabel>
                <Styled.CashInput
                  type="text"
                  value={leaveInCash}
                  onChange={(e) => {
                    const value = e.target.value
                    const regex = /^[0-9.,\s]*$/
                    if (regex.test(value)) {
                      setLeaveInCash(value)
                      setError(null)
                    }
                  }}
                  placeholder="Оставить все"
                  disabled={endShift.isPending}
                />
                <Styled.HelperText>Оставьте пустым чтобы передать всю сумму следующей смене</Styled.HelperText>
              </Styled.InputWrapper>
            </>
          ) : (
            <>
              {isLoading ? (
                <Styled.LoadingText>Загрузка данных смены...</Styled.LoadingText>
              ) : activeShift ? (
                <>
                  <Styled.ShiftStats>
                    <Styled.ShiftStatsHeader>Статистика смены</Styled.ShiftStatsHeader>

                    <Styled.StatRow>
                      <Styled.StatLabel>Время открытия:</Styled.StatLabel>
                      <Styled.StatValue>{formatDateTime(activeShift.start_time)}</Styled.StatValue>
                    </Styled.StatRow>

                    <Styled.StatRow>
                      <Styled.StatLabel>Длительность:</Styled.StatLabel>
                      <Styled.StatValue>{calculateDuration(activeShift.start_time)}</Styled.StatValue>
                    </Styled.StatRow>

                    <Styled.StatRow>
                      <Styled.StatLabel>На начало смены:</Styled.StatLabel>
                      <Styled.StatValue>{formatPrice(activeShift.initial_cash)}</Styled.StatValue>
                    </Styled.StatRow>

                    <Styled.StatDivider />

                    <Styled.StatRow>
                      <Styled.StatLabel>Сессий:</Styled.StatLabel>
                      <Styled.StatValue>{activeShift.sessions?.length || 0}</Styled.StatValue>
                    </Styled.StatRow>

                    <Styled.StatRow>
                      <Styled.StatLabel>Заведение:</Styled.StatLabel>
                      <Styled.StatValue>{activeShift.establishment?.name || '-'}</Styled.StatValue>
                    </Styled.StatRow>
                  </Styled.ShiftStats>
                </>
              ) : (
                <Styled.NoShiftMessage>Нет активной смены</Styled.NoShiftMessage>
              )}
            </>
          )}
        </Styled.ModalBody>

        <Styled.ModalFooter>
          {showEndShift ? (
            <>
              <Styled.CancelButton onClick={() => setShowEndShift(false)}>
                Отмена
              </Styled.CancelButton>
              <Styled.EndButton
                onClick={handleEndShift}
                disabled={finalCash.trim() === '' || endShift.isPending}
              >
                {endShift.isPending ? 'Закрытие...' : 'Закрыть смену'}
              </Styled.EndButton>
            </>
          ) : (
            <>
              <Styled.CancelButton onClick={handleClose}>
                Закрыть
              </Styled.CancelButton>
              {activeShift && (
                <>
                  <Styled.RecountButton onClick={() => {/* TODO: добавить функционал пересчета */}}>
                    Пересчет
                  </Styled.RecountButton>
                  <Styled.EndButton onClick={() => setShowEndShift(true)}>
                    Закрыть смену
                  </Styled.EndButton>
                </>
              )}
            </>
          )}
        </Styled.ModalFooter>
      </Styled.ModalContent>
    </Styled.ModalOverlay>
  )
}

export default ShiftMenuModal
