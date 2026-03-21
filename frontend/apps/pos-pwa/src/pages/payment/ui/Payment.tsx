import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Styled from './styled'
import { useCurrentUser } from '@restaurant-pos/api-client'
import { apiClient } from '@restaurant-pos/api-client'

type ActiveField = 'card' | 'cash'

export function Payment() {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { data: currentUser } = useCurrentUser()
  const establishmentId = currentUser?.establishment_id || ''

  const [cardAmount, setCardAmount] = useState('')
  const [cashAmount, setCashAmount] = useState('')
  const [activeField, setActiveField] = useState<ActiveField>('card')
  const [totalAmount, setTotalAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [printReceipt, setPrintReceipt] = useState(false)
  const [pricingBreakdown, setPricingBreakdown] = useState<Array<{ code: string; amount: number; message?: string }>>([])

  const buildItemsForCalculate = (orderData: any) => {
    return (orderData?.guests || []).flatMap((guest: any) =>
      (guest.items || []).map((item: any) => {
        const payload: any = {
          quantity: item.quantity,
          guest_number: guest.guestNumber,
        }
        if (item.itemType === 'product' && item.productId) {
          payload.product_id = item.productId
        }
        if (item.itemType === 'tech_card' && item.techCardId) {
          payload.tech_card_id = item.techCardId
        }
        // Добавляем client_id для каждой позиции если у гостя есть клиент
        if (guest.customer?.id) {
          payload.client_id = guest.customer.id
        }
        return payload
      })
    ).filter((item: any) => item.product_id || item.tech_card_id)
  }

  const recalculateFromServer = async (items: any[]) => {
    const response = await apiClient.post('/orders/calculate', { items })
    const calculation = response.data?.data
    if (!calculation) {
      throw new Error('Пустой ответ расчета')
    }
    setTotalAmount(Number(calculation.final_amount || 0))
    setPricingBreakdown(Array.isArray(calculation.applied_rules) ? calculation.applied_rules : [])
    return calculation
  }

  // Загружаем данные заказа
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const ORDER_STORAGE_KEY = 'order_data_'
        const stored = localStorage.getItem(`${ORDER_STORAGE_KEY}${orderId}`)
        console.log('[Payment] Loading order data:', {
          orderId,
          hasStored: !!stored,
          storageKey: `${ORDER_STORAGE_KEY}${orderId}`
        })
        if (stored) {
          const orderData = JSON.parse(stored)
          console.log('[Payment] Loaded order from localStorage:', orderData)
          const calcItems = buildItemsForCalculate(orderData)
          if (calcItems.length > 0) {
            await recalculateFromServer(calcItems)
          } else {
            setTotalAmount(orderData.finalAmount || 0)
          }
          setCardAmount('0')
          setCashAmount('0')
        } else {
          // Если нет данных в localStorage, пробуем получить с сервера
          const response = await apiClient.get(`/orders/${orderId}`)
          const serverItems = (response.data?.data?.items || []).map((item: any) => ({
            product_id: item.product_id,
            tech_card_id: item.tech_card_id,
            quantity: item.quantity,
            guest_number: item.guest_number,
          }))
          if (serverItems.length > 0) {
            await recalculateFromServer(serverItems)
          } else {
            const total = response.data.data?.total_amount || response.data.data?.totalAmount || 0
            setTotalAmount(total)
          }
          setCardAmount('0')
          setCashAmount('0')
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
    const currentAmount = activeField === 'card' ? cardAmount : cashAmount
    let newValue = currentAmount
    
    if (value === 'backspace') {
      newValue = currentAmount.slice(0, -1)
    } else if (value === '.') {
      if (!currentAmount.includes('.')) {
        newValue = currentAmount + '.'
      }
    } else {
      // Если текущее значение '0' или пусто, заменяем его на новую цифру
      if (currentAmount === '0' || currentAmount === '') {
        newValue = value
      } else {
        newValue = currentAmount + value
      }
    }

    if (activeField === 'card') {
      setCardAmount(newValue)
    } else {
      setCashAmount(newValue)
    }
    
    setError(null)
  }

  const handleQuickAmount = (amount: string) => {
    const numAmount = parseFloat(amount)
    
    if (activeField === 'card') {
      const currentCard = parseFloat(cardAmount || '0') || 0
      const newCard = currentCard + numAmount
      setCardAmount(String(newCard.toFixed(2)))
    } else {
      const currentCash = parseFloat(cashAmount || '0') || 0
      const newCash = currentCash + numAmount
      setCashAmount(String(newCash.toFixed(2)))
    }
    
    setError(null)
  }

  const handleFillRemaining = () => {
    const cardNum = parseFloat(cardAmount || '0') || 0
    const cashNum = parseFloat(cashAmount || '0') || 0
    const totalPaidSoFar = cardNum + cashNum
    const remaining = Math.max(0, totalAmount - totalPaidSoFar)
    
    if (activeField === 'card') {
      const newCard = cardNum + remaining
      setCardAmount(String(newCard.toFixed(2)))
    } else {
      const newCash = cashNum + remaining
      setCashAmount(String(newCash.toFixed(2)))
    }
    
    setError(null)
  }

  const handleBack = useCallback(() => {
    navigate(`/order/${orderId}`)
  }, [navigate, orderId])

  const cardNum = parseFloat(cardAmount || '0') || 0
  const cashNum = parseFloat(cashAmount || '0') || 0
  
  const totalPaid = cardNum + cashNum
  const cashChange = Math.max(0, cashNum - Math.max(0, totalAmount - cardNum))
  const remainingAmount = Math.max(0, totalAmount - totalPaid)

  const isPayDisabled = () => {
    if (isProcessing) return true
    // Проверяем, что общая сумма покрывает заказ
    return totalPaid < totalAmount - 0.01
  }

  const handlePayment = useCallback(async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const isUuid = (value: string) =>
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

      let serverOrderId = orderId || ''
      let serverFinalAmount = totalAmount

      // Если orderId не UUID, сначала создаём заказ
      if (!isUuid(serverOrderId)) {
        const ORDER_STORAGE_KEY = 'order_data_'
        const stored = localStorage.getItem(`${ORDER_STORAGE_KEY}${orderId}`)
        if (stored) {
          const orderData = JSON.parse(stored)
          const itemsToSend = buildItemsForCalculate(orderData)

          if (itemsToSend.length === 0) {
            throw new Error('Невозможно создать пустой заказ. Добавьте блюда перед оплатой.')
          }

          const calculation = await recalculateFromServer(itemsToSend)
          serverFinalAmount = Number(calculation.final_amount || 0)

          // Для создания заказа не передаем total_amount: сервер сам посчитает итог,
          // это исключает конфликт total/final после акций и скидок.
          const orderPayload: any = {
            items: itemsToSend,
          }
          // Передаем client_id если выбран клиент (для начисления баллов)
          if (orderData?.selectedCustomer?.id) {
            orderPayload.client_id = orderData.selectedCustomer.id
            console.log('[Payment Order] Sending client_id:', orderData.selectedCustomer.id, 'Customer:', orderData.selectedCustomer.name)
          } else {
            console.log('[Payment Order] No customer selected, client_id will be NULL')
          }
          console.log('[Payment Order] Full orderData:', orderData)
          console.log('[Payment Order] Payload:', JSON.stringify(orderPayload, null, 2))
          const orderResponse = await apiClient.post('/orders', orderPayload)
          serverOrderId = orderResponse?.data?.id
        }
      }

      if (!serverOrderId) {
        throw new Error('Не удалось создать заказ на сервере')
      }

      // Проверяем валидность сумм перед платежом
      if (cardNum < 0 || cashNum < 0) {
        throw new Error('Сумма платежа не может быть отрицательной')
      }

      if (cardNum === 0 && cashNum === 0) {
        throw new Error('Укажите сумму платежа')
      }

      if (cardNum + cashNum < serverFinalAmount - 0.01) {
        throw new Error('Общая сумма платежа меньше суммы заказа')
      }

      // Отправляем запрос на оплату
      // Бэкенд сам ограничит суммы транзакций до суммы заказа
      await apiClient.post(`/orders/${serverOrderId}/pay`, {
        cash_amount: cashNum,
        card_amount: cardNum,
        client_cash: cashNum,
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
  }, [isProcessing, orderId, cardNum, cashNum, totalAmount, navigate])

  const handleClose = useCallback(() => {
    console.log('[Payment] handleClose - navigating to order:', orderId)
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
      {/* Верхний навигационный header */}
      <Styled.TopNavHeader>
        <Styled.NavButton onClick={handleClose}>
          ← Отмена
        </Styled.NavButton>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <Styled.NavTitle>Квитанция #{orderId?.slice(-4)}</Styled.NavTitle>
          <Styled.NavSubtitle>Стол 2</Styled.NavSubtitle>
        </div>
        <Styled.NavSpacing />
      </Styled.TopNavHeader>

      {/* Основной контент */}
      <Styled.ContentWrapper>
        {/* Левая панель - Клавиатура */}
        <Styled.LeftPanel>
        {/* Быстрые кнопки суммы */}
        <Styled.QuickAmountGrid>
          {['50', '100'].map((num) => (
            <Styled.KeyboardButton key={num} onClick={() => handleQuickAmount(num)}>
              {num}
            </Styled.KeyboardButton>
          ))}
          {remainingAmount > 0.01 && (
            <Styled.KeyboardButton 
              key="remaining" 
              onClick={handleFillRemaining}
              style={{ backgroundColor: '#10b981', color: 'white' }}
            >
              Остаток {remainingAmount.toFixed(0)}
            </Styled.KeyboardButton>
          )}
        </Styled.QuickAmountGrid>
        
        {/* Основная клавиатура */}
        <Styled.KeyboardGrid>
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
        <Styled.TotalSection>
          <Styled.TotalLabel>К оплате:</Styled.TotalLabel>
          <Styled.TotalAmount>{totalAmount.toFixed(2)} ₽</Styled.TotalAmount>
        </Styled.TotalSection>

        {pricingBreakdown.length > 0 && (
          <div style={{ marginBottom: '12px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Серверный breakdown</div>
            {pricingBreakdown.map((rule) => (
              <div key={`${rule.code}-${rule.message || ''}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: '#374151' }}>
                <span>{rule.message || rule.code}</span>
                <span>{rule.amount.toFixed(2)} ₽</span>
              </div>
            ))}
          </div>
        )}

        {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

        <Styled.PaymentMethodsSection>
          <Styled.PaymentMethodLabel>Способ оплаты</Styled.PaymentMethodLabel>
          <Styled.PaymentMethodsRow>
            <Styled.EditablePaymentField
              $active={activeField === 'card'}
              onClick={() => setActiveField('card')}
            >
              <Styled.PaymentFieldIcon>💳</Styled.PaymentFieldIcon>
              <Styled.PaymentFieldContent>
                <Styled.PaymentFieldLabel>Карта</Styled.PaymentFieldLabel>
                <Styled.PaymentFieldAmount>{cardNum.toFixed(2)} ₽</Styled.PaymentFieldAmount>
              </Styled.PaymentFieldContent>
            </Styled.EditablePaymentField>
            
            <Styled.EditablePaymentField
              $active={activeField === 'cash'}
              onClick={() => setActiveField('cash')}
            >
              <Styled.PaymentFieldIcon>💵</Styled.PaymentFieldIcon>
              <Styled.PaymentFieldContent>
                <Styled.PaymentFieldLabel>Наличные</Styled.PaymentFieldLabel>
                <Styled.PaymentFieldAmount>{cashNum.toFixed(2)} ₽</Styled.PaymentFieldAmount>
                {cashChange > 0.01 && (
                  <Styled.ChangeHint>Сдача: {cashChange.toFixed(2)} ₽</Styled.ChangeHint>
                )}
              </Styled.PaymentFieldContent>
            </Styled.EditablePaymentField>
          </Styled.PaymentMethodsRow>
          
          {remainingAmount > 0.01 && (
            <Styled.RemainingAmount>
              Осталось оплатить: {remainingAmount.toFixed(2)} ₽
            </Styled.RemainingAmount>
          )}
        </Styled.PaymentMethodsSection>

        <Styled.OptionsRow>
          <Styled.OptionLabel>Печать чека</Styled.OptionLabel>
          <Styled.Toggle
            checked={printReceipt}
            onChange={(e) => setPrintReceipt(e.target.checked)}
          />
        </Styled.OptionsRow>

        <Styled.ButtonsFooter>
          <Styled.PayButton
            onClick={handlePayment}
            disabled={isPayDisabled()}
            style={{ flex: 1 }}
          >
            {isProcessing ? 'Обработка...' : `Оплатить ${totalPaid.toFixed(2)} ₽`}
          </Styled.PayButton>
        </Styled.ButtonsFooter>
      </Styled.RightPanel>
      </Styled.ContentWrapper>
    </Styled.Container>
  )
}
