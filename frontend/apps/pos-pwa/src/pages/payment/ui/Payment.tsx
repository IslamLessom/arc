import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Styled from './styled'
import { useCurrentUser } from '@restaurant-pos/api-client'
import { apiClient } from '@restaurant-pos/api-client'

type PaymentMethod = 'cash' | 'card' | 'split'

// Иконки
const ICONS = {
  cash: '💵',
  card: '💳',
  split: '🔀',
}

const NAMES = {
  cash: 'Наличные',
  card: 'Карта',
  split: 'Разделить',
}

export function Payment() {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { data: currentUser } = useCurrentUser()
  const establishmentId = currentUser?.establishment_id || ''

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [cashAmount, setCashAmount] = useState('')
  const [cardAmount, setCardAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Загружаем данные заказа
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const ORDER_STORAGE_KEY = 'order_data_'
        const stored = localStorage.getItem(`${ORDER_STORAGE_KEY}${orderId}`)
        if (stored) {
          const orderData = JSON.parse(stored)
          setTotalAmount(orderData.totalAmount || 0)
          // По умолчанию выбираем наличными
          setSelectedMethod('cash')
          setCashAmount(String(orderData.totalAmount || 0))
        } else {
          // Если нет данных в localStorage, пробуем получить с сервера
          const response = await apiClient.get(`/orders/${orderId}`)
          setTotalAmount(response.data.data?.total_amount || response.data.data?.totalAmount || 0)
          setSelectedMethod('cash')
          setCashAmount(String(response.data.data?.total_amount || response.data.data?.totalAmount || 0))
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

  const cashAmountNum = useMemo(() => parseFloat(cashAmount.replace(',', '.').replace(/\s/g, '')) || 0, [cashAmount])
  const cardAmountNum = useMemo(() => parseFloat(cardAmount.replace(',', '.').replace(/\s/g, '')) || 0, [cardAmount])

  const remainingAmount = useMemo(() => {
    if (selectedMethod === 'split') {
      return totalAmount - cashAmountNum - cardAmountNum
    }
    return 0
  }, [totalAmount, cashAmountNum, cardAmountNum, selectedMethod])

  const isPayDisabled = useMemo(() => {
    if (isProcessing) return true

    if (selectedMethod === 'cash') {
      return false
    }
    if (selectedMethod === 'card') {
      return false
    }
    if (selectedMethod === 'split') {
      return remainingAmount > 0.01 || cashAmountNum < 0 || cardAmountNum < 0
    }
    return true
  }, [isProcessing, selectedMethod, remainingAmount, cashAmountNum, cardAmountNum])

  const handleMethodSelect = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method)
    setError(null)

    if (method === 'cash') {
      setCashAmount(String(totalAmount))
      setCardAmount('')
    } else if (method === 'card') {
      setCardAmount(String(totalAmount))
      setCashAmount('')
    } else if (method === 'split') {
      setCashAmount('')
      setCardAmount('')
    }
  }, [totalAmount])

  const handleBack = useCallback(() => {
    navigate(`/order/${orderId}`)
  }, [navigate, orderId])

  const handlePayment = useCallback(async () => {
    if (isProcessing || !selectedMethod) return

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
              // Отправляем только product_id или tech_card_id, но не оба
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
          ).filter((item: any) => item.product_id || item.tech_card_id) // Убираем пустые items

          if (itemsToSend.length === 0) {
            throw new Error('Невозможно создать пустой заказ. Добавьте блюда перед оплатой.')
          }

          console.log('Creating order with items:', itemsToSend)
          const orderResponse = await apiClient.post('/orders', { items: itemsToSend })
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
        finalCashAmount = totalAmount
      } else if (selectedMethod === 'card') {
        finalCardAmount = totalAmount
      } else if (selectedMethod === 'split') {
        finalCashAmount = cashAmountNum
        finalCardAmount = cardAmountNum
      }

      console.log('Payment data:', {
        totalAmount,
        selectedMethod,
        finalCashAmount,
        finalCardAmount,
        serverOrderId
      })

      // Проверка что сумма оплаты >= суммы заказа
      const totalPayment = finalCashAmount + finalCardAmount
      if (totalPayment < totalAmount - 0.01) {
        throw new Error(`Сумма оплаты (${totalPayment}) меньше суммы заказа (${totalAmount})`)
      }

      // Отправляем запрос на оплату
      await apiClient.post(`/orders/${serverOrderId}/pay`, {
        cash_amount: finalCashAmount,
        card_amount: finalCardAmount,
        client_cash: finalCashAmount, // client_cash только для наличных
      })

      // Очищаем localStorage
      const ORDER_STORAGE_KEY = 'order_data_'
      localStorage.removeItem(`${ORDER_STORAGE_KEY}${orderId}`)

      // Перенаправляем на страницу успешной оплаты или обратно к столам
      navigate('/table-selection')
    } catch (err: any) {
      console.error('Payment error:', err)
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Ошибка при оплате'
      setError(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, selectedMethod, orderId, totalAmount, cashAmountNum, cardAmountNum, navigate])

  const handleInputChange = (value: string, field: 'cash' | 'card') => {
    const regex = /^[0-9.,\s]*$/
    if (regex.test(value)) {
      if (field === 'cash') {
        setCashAmount(value)
      } else {
        setCardAmount(value)
      }
      setError(null)
    }
  }

  if (isLoading) {
    return (
      <Styled.Container>
        <Styled.Header>
          <Styled.HeaderLeft onClick={handleBack}>
            ←
          </Styled.HeaderLeft>
          <Styled.HeaderCenter>
            <Styled.HeaderTitle>Оплата</Styled.HeaderTitle>
          </Styled.HeaderCenter>
          <Styled.HeaderRight />
        </Styled.Header>
        <Styled.Content>
          <Styled.LoadingSpinner>Загрузка...</Styled.LoadingSpinner>
        </Styled.Content>
      </Styled.Container>
    )
  }

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.HeaderLeft onClick={handleBack}>
          ← Назад
        </Styled.HeaderLeft>
        <Styled.HeaderCenter>
          <Styled.HeaderTitle>Оплата заказа</Styled.HeaderTitle>
          <Styled.HeaderSubtitle>#{orderId?.slice(-8)}</Styled.HeaderSubtitle>
        </Styled.HeaderCenter>
        <Styled.HeaderRight />
      </Styled.Header>

      <Styled.Content>
        {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

        <Styled.SummaryCard>
          <Styled.SummaryTitle>К оплате</Styled.SummaryTitle>
          <Styled.SummaryRow>
            <Styled.SummaryLabel>Сумма заказа</Styled.SummaryLabel>
            <Styled.SummaryValue>{totalAmount.toFixed(2)} ₽</Styled.SummaryValue>
          </Styled.SummaryRow>
          <Styled.SummaryRow>
            <Styled.SummaryLabel>Итого к оплате</Styled.SummaryLabel>
            <Styled.TotalValue>{totalAmount.toFixed(2)} ₽</Styled.TotalValue>
          </Styled.SummaryRow>
        </Styled.SummaryCard>

        <Styled.PaymentMethodsGrid>
          {(Object.keys(ICONS) as PaymentMethod[]).map((method) => (
            <Styled.PaymentMethodCard
              key={method}
              $selected={selectedMethod === method}
              onClick={() => handleMethodSelect(method)}
            >
              <Styled.PaymentMethodIcon>{ICONS[method as keyof typeof ICONS]}</Styled.PaymentMethodIcon>
              <Styled.PaymentMethodName>{NAMES[method as keyof typeof NAMES]}</Styled.PaymentMethodName>
            </Styled.PaymentMethodCard>
          ))}
        </Styled.PaymentMethodsGrid>

        {selectedMethod === 'split' && (
          <Styled.SplitPaymentSection>
            <Styled.SplitSectionTitle>Разделить оплату</Styled.SplitSectionTitle>
            <Styled.SplitInputRow>
              <Styled.SplitLabel>Наличные</Styled.SplitLabel>
              <Styled.SplitInput
                type="text"
                value={cashAmount}
                onChange={(e) => handleInputChange(e.target.value, 'cash')}
                placeholder="0.00"
              />
            </Styled.SplitInputRow>
            <Styled.SplitInputRow>
              <Styled.SplitLabel>Карта</Styled.SplitLabel>
              <Styled.SplitInput
                type="text"
                value={cardAmount}
                onChange={(e) => handleInputChange(e.target.value, 'card')}
                placeholder="0.00"
              />
            </Styled.SplitInputRow>
            {remainingAmount > 0.01 && (
              <Styled.RemainingAmount>
                Осталось оплатить: {remainingAmount.toFixed(2)} ₽
              </Styled.RemainingAmount>
            )}
          </Styled.SplitPaymentSection>
        )}

        <Styled.PayButton
          onClick={handlePayment}
          $disabled={isPayDisabled || !selectedMethod}
        >
          {isProcessing ? 'Обработка...' : `Оплатить ${totalAmount.toFixed(2)} ₽`}
        </Styled.PayButton>
      </Styled.Content>
    </Styled.Container>
  )
}
