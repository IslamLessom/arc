import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Styled from './styled'
import { useCurrentUser } from '@restaurant-pos/api-client'
import { apiClient } from '@restaurant-pos/api-client'

type PaymentMethod = 'cash' | 'card' | 'split'

export function Payment() {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { data: currentUser } = useCurrentUser()
  const establishmentId = currentUser?.establishment_id || ''

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash')
  const [inputAmount, setInputAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [printReceipt, setPrintReceipt] = useState(false)

  // Загружаем данные заказа
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const ORDER_STORAGE_KEY = 'order_data_'
        const stored = localStorage.getItem(`${ORDER_STORAGE_KEY}${orderId}`)
        if (stored) {
          const orderData = JSON.parse(stored)
          setTotalAmount(orderData.totalAmount || 0)
          setInputAmount(String(orderData.totalAmount || 0))
        } else {
          // Если нет данных в localStorage, пробуем получить с сервера
          const response = await apiClient.get(`/orders/${orderId}`)
          setTotalAmount(response.data.data?.total_amount || response.data.data?.totalAmount || 0)
          setInputAmount(String(response.data.data?.total_amount || response.data.data?.totalAmount || 0))
        }
      } catch (err) {
        setError('Не удалось загрузить данные заказа')
        console.error('Failed to fetch order:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (orderId) {
      fetchOrderData()
    }
  }, [orderId])

  const handleKeyboardInput = (value: string) => {
    if (value === 'backspace') {
      setInputAmount(prev => prev.slice(0, -1))
    } else if (value === '.') {
      if (!inputAmount.includes('.')) {
        setInputAmount(prev => prev + '.')
      }
    } else {
      setInputAmount(prev => prev + value)
    }
    setError(null)
  }

  const handleBack = useCallback(() => {
    navigate(`/order/${orderId}`)
  }, [navigate, orderId])

  const currentAmount = parseFloat(inputAmount || '0') || 0
  const displayAmount = currentAmount > 0 ? currentAmount : totalAmount

  const handlePayment = useCallback(async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const isUuid = (value: string) =>
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

      let serverOrderId = orderId || ''

      // Если orderId не UUID, сначала создаём заказ
      if (!isUuid(serverOrderId)) {
        const ORDER_STORAGE_KEY = 'order_data_'
        const stored = localStorage.getItem(`${ORDER_STORAGE_KEY}${orderId}`)
        if (stored) {
          const orderData = JSON.parse(stored)
          const itemsToSend = orderData.guests.flatMap((guest: any) =>
            guest.items.map((item: any) => {
              const result: any = {
                quantity: item.quantity,
                guest_number: guest.guestNumber,
              }
              if (item.itemType === 'product' && item.productId) {
                result.product_id = item.productId
              } else if (item.itemType === 'tech_card' && item.techCardId) {
                result.tech_card_id = item.techCardId
              }
              return result
            })
          ).filter((item: any) => item.product_id || item.tech_card_id)

          if (itemsToSend.length === 0) {
            throw new Error('Невозможно создать пустой заказ. Добавьте блюда перед оплатой.')
          }

          const orderResponse = await apiClient.post('/orders', {
            items: itemsToSend,
            total_amount: orderData.totalAmount || 0,
          })
          serverOrderId = orderResponse?.data?.id
        }
      }

      if (!serverOrderId) {
        throw new Error('Не удалось создать заказ на сервере')
      }

      // Определяем суммы для оплаты
      let finalCashAmount = 0
      let finalCardAmount = 0

      if (selectedMethod === 'cash') {
        finalCashAmount = displayAmount
      } else if (selectedMethod === 'card') {
        finalCardAmount = displayAmount
      }

      // Отправляем запрос на оплату
      await apiClient.post(`/orders/${serverOrderId}/pay`, {
        cash_amount: finalCashAmount,
        card_amount: finalCardAmount,
        client_cash: finalCashAmount,
      })

      // Очищаем localStorage
      const ORDER_STORAGE_KEY = 'order_data_'
      localStorage.removeItem(`${ORDER_STORAGE_KEY}${orderId}`)

      navigate('/table-selection')
    } catch (err: any) {
      console.error('Payment error:', err)
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Ошибка при оплате'
      setError(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, selectedMethod, orderId, displayAmount, navigate])

  const handleClose = useCallback(() => {
    navigate(`/order/${orderId}`)
  }, [navigate, orderId])

  if (isLoading) {
    return (
      <Styled.Container>
        <Styled.LoadingSpinner>Загрузка...</Styled.LoadingSpinner>
      </Styled.Container>
    )
  }

  return (
    <Styled.Container>
      {/* Левая панель - Клавиатура */}
      <Styled.LeftPanel>
        <Styled.KeyboardGrid>
          {['50', '100'].map((num) => (
            <Styled.KeyboardButton key={num} onClick={() => setInputAmount(num)}>
              {num}
            </Styled.KeyboardButton>
          ))}
          {['7', '8', '9'].map((num) => (
            <Styled.KeyboardButton key={num} onClick={() => handleKeyboardInput(num)}>
              {num}
            </Styled.KeyboardButton>
          ))}
          {['4', '5', '6'].map((num) => (
            <Styled.KeyboardButton key={num} onClick={() => handleKeyboardInput(num)}>
              {num}
            </Styled.KeyboardButton>
          ))}
          {['1', '2', '3'].map((num) => (
            <Styled.KeyboardButton key={num} onClick={() => handleKeyboardInput(num)}>
              {num}
            </Styled.KeyboardButton>
          ))}
          <Styled.KeyboardButton onClick={() => handleKeyboardInput('.')}>
            .
          </Styled.KeyboardButton>
          <Styled.KeyboardButton onClick={() => handleKeyboardInput('0')}>
            0
          </Styled.KeyboardButton>
          <Styled.KeyboardButton onClick={() => handleKeyboardInput('backspace')}>
            ⌫
          </Styled.KeyboardButton>
        </Styled.KeyboardGrid>
      </Styled.LeftPanel>

      {/* Правая панель - Информация об оплате */}
      <Styled.RightPanel>
        <Styled.Header>
          <Styled.HeaderTitle>Receipt #{orderId?.slice(-4)}</Styled.HeaderTitle>
          <Styled.HeaderSubtitle>Table 2</Styled.HeaderSubtitle>
        </Styled.Header>

        <Styled.TotalSection>
          <Styled.TotalLabel>Total:</Styled.TotalLabel>
          <Styled.TotalAmount>{displayAmount.toFixed(2)} ₽</Styled.TotalAmount>
        </Styled.TotalSection>

        {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

        <Styled.PaymentMethodsSection>
          <Styled.PaymentMethodLabel>Select payment method</Styled.PaymentMethodLabel>
          <Styled.PaymentMethodsRow>
            <Styled.PaymentMethodOption
              $selected={selectedMethod === 'cash'}
              onClick={() => setSelectedMethod('cash')}
            >
              <Styled.PaymentMethodOptionIcon>💵</Styled.PaymentMethodOptionIcon>
              <Styled.PaymentMethodOptionText>Cash</Styled.PaymentMethodOptionText>
              <Styled.PaymentMethodOptionAmount>0 ₽</Styled.PaymentMethodOptionAmount>
            </Styled.PaymentMethodOption>
            <Styled.PaymentMethodOption
              $selected={selectedMethod === 'card'}
              onClick={() => setSelectedMethod('card')}
            >
              <Styled.PaymentMethodOptionIcon>💳</Styled.PaymentMethodOptionIcon>
              <Styled.PaymentMethodOptionText>Card</Styled.PaymentMethodOptionText>
              <Styled.PaymentMethodOptionAmount>0 ₽</Styled.PaymentMethodOptionAmount>
            </Styled.PaymentMethodOption>
            <Styled.PaymentMethodOption
              $selected={selectedMethod === 'gift_card'}
              onClick={() => setSelectedMethod('gift_card')}
            >
              <Styled.PaymentMethodOptionIcon>🎁</Styled.PaymentMethodOptionIcon>
              <Styled.PaymentMethodOptionText>Gift card</Styled.PaymentMethodOptionText>
              <Styled.PaymentMethodOptionAmount>0 ₽</Styled.PaymentMethodOptionAmount>
            </Styled.PaymentMethodOption>
          </Styled.PaymentMethodsRow>
        </Styled.PaymentMethodsSection>

        <Styled.OptionsRow>
          <Styled.OptionLabel>Print receipt</Styled.OptionLabel>
          <Styled.Toggle
            checked={printReceipt}
            onChange={(e) => setPrintReceipt(e.target.checked)}
          />
        </Styled.OptionsRow>

        <Styled.ButtonsFooter>
          <Styled.CloseButton onClick={handleClose}>
            Close without payment
          </Styled.CloseButton>
          <Styled.PayButton
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay'}
          </Styled.PayButton>
        </Styled.ButtonsFooter>
      </Styled.RightPanel>
    </Styled.Container>
  )
}
