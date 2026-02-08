import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Styled from './styled'
import { useOrders } from '@restaurant-pos/api-client'
import { useCurrentUser } from '@restaurant-pos/api-client'

export function ReceiptsArchive() {
  const navigate = useNavigate()
  const { data: currentUser } = useCurrentUser()
  const establishmentId = currentUser?.establishment_id || ''

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Загружаем все заказы
  const { data: orders = [], isLoading } = useOrders({
    establishmentId,
  })

  // Фильтруем только оплаченные заказы
  const paidOrders = useMemo(() => {
    return orders.filter(order => order.status === 'paid' || order.payment_status === 'paid')
  }, [orders])

  // Применяем фильтр по дате
  const filteredOrders = useMemo(() => {
    const now = new Date()
    now.setHours(23, 59, 59, 999)

    return paidOrders.filter(order => {
      const orderDate = new Date(order.created_at)
      orderDate.setHours(0, 0, 0, 0)

      switch (selectedFilter) {
        case 'today':
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return orderDate.getTime() === today.getTime()

        case 'week':
          const weekAgo = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return orderDate >= weekAgo

        case 'month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return orderDate >= monthAgo

        default:
          return true
      }
    })
  }, [paidOrders, selectedFilter])

  // Применяем поиск
  const searchedOrders = useMemo(() => {
    if (!searchQuery.trim()) return filteredOrders

    const query = searchQuery.toLowerCase()
    return filteredOrders.filter(order => {
      const orderNum = order.id.slice(-6).toLowerCase()
      const tableNum = order.table_number?.toString() || ''
      return orderNum.includes(query) || tableNum.includes(query)
    })
  }, [filteredOrders, searchQuery])

  // Группируем заказы по дате
  const groupedOrders = useMemo(() => {
    const groups = new Map<string, typeof searchedOrders>()

    searchedOrders.forEach(order => {
      const date = new Date(order.created_at)
      const dateKey = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== new Date().getFullYear() ? date.getFullYear() : undefined
      })

      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)?.push(order)
    })

    // Сортируем группы по дате (новые сначала)
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
      const dateA = new Date(a[1][0].created_at)
      const dateB = new Date(b[1][0].created_at)
      return dateB.getTime() - dateA.getTime()
    })

    return sortedGroups
  }, [searchedOrders])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2).replace('.', ',')} ₽`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const orderDate = new Date(dateString)
    orderDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((today.getTime() - orderDate.getTime()) / 86400000)

    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleReceiptClick = (orderId: string) => {
    // TODO: Показать детали чека
    console.log('Receipt clicked:', orderId)
  }

  const renderPaymentInfo = (order: any) => {
    const hasCash = (order.cash_amount || 0) > 0
    const hasCard = (order.card_amount || 0) > 0

    return (
      <Styled.PaymentInfo>
        {hasCash && (
          <Styled.PaymentInfoItem>
            <span>💵</span>
            <span>{formatPrice(order.cash_amount || 0)}</span>
          </Styled.PaymentInfoItem>
        )}
        {hasCard && (
          <Styled.PaymentInfoItem>
            <span>💳</span>
            <span>{formatPrice(order.card_amount || 0)}</span>
          </Styled.PaymentInfoItem>
        )}
      </Styled.PaymentInfo>
    )
  }

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.HeaderLeft onClick={handleBack}>
          ← Назад
        </Styled.HeaderLeft>
        <Styled.HeaderTitle>Архив чеков</Styled.HeaderTitle>
        <div style={{ width: '60px' }} />
      </Styled.Header>

      <Styled.Content>
        <Styled.FilterSection>
          <Styled.FilterButton
            $active={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
          >
            Все
          </Styled.FilterButton>
          <Styled.FilterButton
            $active={selectedFilter === 'today'}
            onClick={() => setSelectedFilter('today')}
          >
            Сегодня
          </Styled.FilterButton>
          <Styled.FilterButton
            $active={selectedFilter === 'week'}
            onClick={() => setSelectedFilter('week')}
          >
            Неделя
          </Styled.FilterButton>
          <Styled.FilterButton
            $active={selectedFilter === 'month'}
            onClick={() => setSelectedFilter('month')}
          >
            Месяц
          </Styled.FilterButton>
          <Styled.SearchInput
            type="text"
            placeholder="Поиск по номеру или столу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Styled.FilterSection>

        {isLoading ? (
          <Styled.LoadingSpinner>Загрузка...</Styled.LoadingSpinner>
        ) : searchedOrders.length === 0 ? (
          <Styled.EmptyState>
            <Styled.EmptyIcon>🧾</Styled.EmptyIcon>
            <Styled.EmptyText>Нет чеков</Styled.EmptyText>
          </Styled.EmptyState>
        ) : (
          <>
            {groupedOrders.map(([dateLabel, dateOrders]) => (
              <Styled.DateSection key={dateLabel}>
                <Styled.DateTitle>
                  {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)} ({dateOrders.length})
                </Styled.DateTitle>
                <Styled.ReceiptList>
                  {dateOrders.map(order => (
                    <Styled.ReceiptCard
                      key={order.id}
                      onClick={() => handleReceiptClick(order.id)}
                    >
                      <Styled.ReceiptHeader>
                        <Styled.ReceiptNumber>Чек №{order.id.slice(-6)}</Styled.ReceiptNumber>
                        <Styled.ReceiptStatus>Оплачен</Styled.ReceiptStatus>
                      </Styled.ReceiptHeader>
                      <Styled.ReceiptDetails>
                        <Styled.ReceiptInfo>
                          <Styled.ReceiptTable>
                            Стол {order.table_number || '-'} • {order.items?.length || 0} позиций
                          </Styled.ReceiptTable>
                          <Styled.ReceiptTime>{formatTime(order.created_at)}</Styled.ReceiptTime>
                        </Styled.ReceiptInfo>
                        <Styled.ReceiptTotal>{formatPrice(order.total_amount)}</Styled.ReceiptTotal>
                      </Styled.ReceiptDetails>
                      {renderPaymentInfo(order)}
                    </Styled.ReceiptCard>
                  ))}
                </Styled.ReceiptList>
              </Styled.DateSection>
            ))}
          </>
        )}
      </Styled.Content>
    </Styled.Container>
  )
}
