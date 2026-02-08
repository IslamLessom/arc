import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Styled from './styled'
import { useOrders } from '@restaurant-pos/api-client'
import { useCurrentUser } from '@restaurant-pos/api-client'

type OrderStatus = 'draft' | 'confirmed' | 'preparing' | 'ready' | 'paid' | 'cancelled'

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Черновик',
  confirmed: 'Подтверждён',
  preparing: 'Готовится',
  ready: 'Готов',
  paid: 'Оплачен',
  cancelled: 'Отменён',
}

const STATUS_FILTERS = [
  { key: 'all' as const, label: 'Все' },
  { key: 'draft' as const, label: 'Черновики' },
  { key: 'confirmed' as const, label: 'Активные' },
  { key: 'paid' as const, label: 'Оплаченные' },
]

export function OrdersArchive() {
  const navigate = useNavigate()
  const { data: currentUser } = useCurrentUser()
  const establishmentId = currentUser?.establishment_id || ''
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  // Загружаем все заказы
  const { data: orders = [], isLoading } = useOrders({
    establishmentId,
  })

  // Фильтруем заказы по статусу
  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'all') {
      return orders
    }
    if (selectedFilter === 'draft') {
      return orders.filter(o => o.status === 'draft')
    }
    if (selectedFilter === 'confirmed') {
      return orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status))
    }
    if (selectedFilter === 'paid') {
      return orders.filter(o => o.status === 'paid')
    }
    return orders
  }, [orders, selectedFilter])

  // Группируем заказы по дате
  const groupedOrders = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders: typeof orders = []
    const yesterdayOrders: typeof orders = []
    const olderOrders: typeof orders = []

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at)
      orderDate.setHours(0, 0, 0, 0)

      if (orderDate.getTime() === today.getTime()) {
        todayOrders.push(order)
      } else if (orderDate.getTime() === today.getTime() - 86400000) {
        yesterdayOrders.push(order)
      } else {
        olderOrders.push(order)
      }
    })

    return { todayOrders, yesterdayOrders, olderOrders }
  }, [filteredOrders])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
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
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2).replace('.', ',')} ₽`
  }

  const handleOrderClick = (orderId: string) => {
    navigate(`/order/${orderId}`)
  }

  const handleBack = () => {
    navigate('/')
  }

  const renderOrderSection = (title: string, sectionOrders: typeof filteredOrders) => {
    if (sectionOrders.length === 0) return null

    return (
      <div key={title}>
        <Styled.OrderTable>{title} ({sectionOrders.length})</Styled.OrderTable>
        <Styled.OrdersList>
          {sectionOrders.map(order => (
            <Styled.OrderCard
              key={order.id}
              $status={order.status}
              onClick={() => handleOrderClick(order.id)}
            >
              <Styled.OrderHeader>
                <Styled.OrderNumber>№{order.id.slice(-6)}</Styled.OrderNumber>
                <Styled.OrderStatus $status={order.status}>
                  {STATUS_LABELS[order.status as OrderStatus] || order.status}
                </Styled.OrderStatus>
              </Styled.OrderHeader>
              <Styled.OrderDetails>
                <Styled.OrderInfo>
                  <Styled.OrderTable>
                    Стол {order.table_number || '-'} • {(order.items?.length || 0)} позиций
                  </Styled.OrderTable>
                  <Styled.OrderTime>{formatTime(order.created_at)}</Styled.OrderTime>
                </Styled.OrderInfo>
                <Styled.OrderTotal>{formatPrice(order.total_amount)}</Styled.OrderTotal>
              </Styled.OrderDetails>
            </Styled.OrderCard>
          ))}
        </Styled.OrdersList>
      </div>
    )
  }

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.HeaderLeft onClick={handleBack}>
          ← Назад
        </Styled.HeaderLeft>
        <Styled.HeaderTitle>Архив заказов</Styled.HeaderTitle>
        <div style={{ width: '60px' }} />
      </Styled.Header>

      <Styled.Content>
        <Styled.FilterTabs>
          {STATUS_FILTERS.map(filter => (
            <Styled.FilterTab
              key={filter.key}
              $active={selectedFilter === filter.key}
              onClick={() => setSelectedFilter(filter.key)}
            >
              {filter.label}
            </Styled.FilterTab>
          ))}
        </Styled.FilterTabs>

        {isLoading ? (
          <Styled.LoadingSpinner>Загрузка...</Styled.LoadingSpinner>
        ) : filteredOrders.length === 0 ? (
          <Styled.EmptyState>
            <Styled.EmptyIcon>📋</Styled.EmptyIcon>
            <Styled.EmptyText>Нет заказов</Styled.EmptyText>
          </Styled.EmptyState>
        ) : (
          <>
            {renderOrderSection('Сегодня', groupedOrders.todayOrders)}
            {renderOrderSection('Вчера', groupedOrders.yesterdayOrders)}
            {groupedOrders.olderOrders.length > 0 && (
              <Styled.OrderTable>Ранее</Styled.OrderTable>
            )}
            {groupedOrders.olderOrders.map(order => (
              <Styled.OrdersList key={order.id}>
                <Styled.OrderCard
                  $status={order.status}
                  onClick={() => handleOrderClick(order.id)}
                >
                  <Styled.OrderHeader>
                    <Styled.OrderNumber>№{order.id.slice(-6)}</Styled.OrderNumber>
                    <Styled.OrderStatus $status={order.status}>
                      {STATUS_LABELS[order.status as OrderStatus] || order.status}
                    </Styled.OrderStatus>
                  </Styled.OrderHeader>
                  <Styled.OrderDetails>
                    <Styled.OrderInfo>
                      <Styled.OrderTable>
                        Стол {order.table_number || '-'} • {(order.items?.length || 0)} позиций
                      </Styled.OrderTable>
                      <Styled.OrderTime>{formatDate(order.created_at)} • {formatTime(order.created_at)}</Styled.OrderTime>
                    </Styled.OrderInfo>
                    <Styled.OrderTotal>{formatPrice(order.total_amount)}</Styled.OrderTotal>
                  </Styled.OrderDetails>
                </Styled.OrderCard>
              </Styled.OrdersList>
            ))}
          </>
        )}
      </Styled.Content>
    </Styled.Container>
  )
}
