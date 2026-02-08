import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { db } from '@restaurant-pos/pwa-core'
import type { Order } from '@restaurant-pos/types'

// API Response types (snake_case - как возвращает backend)
export interface ApiOrder {
  id: string
  establishment_id: string
  establishment?: {
    id: string
    owner_id: string
    name: string
    address?: string
    phone?: string
    email?: string
    type?: string
    has_seating_places?: boolean
    table_count?: number
    has_delivery?: boolean
    has_takeaway?: boolean
    has_reservations?: boolean
    active?: boolean
    created_at: string
    updated_at: string
  }
  table_id?: string
  table?: {
    id: string
    room_id: string
    number: number
    name?: string
    capacity: number
    position_x?: number
    position_y?: number
    rotation?: number
    width?: number
    height?: number
    shape?: string
    status: string
    active: boolean
    created_at: string
    updated_at: string
  }
  table_number?: number
  status: string
  payment_status?: string
  cash_amount?: number
  card_amount?: number
  total_amount: number
  guests_count?: number
  items?: ApiOrderItem[]
  created_at: string
  updated_at: string
}

export interface ApiOrderItem {
  id: string
  order_id: string
  product_id?: string
  product?: {
    id: string
    establishment_id: string
    category_id: string
    name: string
    description?: string
    cover_image?: string
    price: number
    active: boolean
    created_at: string
    updated_at: string
  }
  tech_card_id?: string
  tech_card?: {
    id: string
    establishment_id: string
    category_id: string
    name: string
    description?: string
    cover_image?: string
    price: number
    active: boolean
    created_at: string
    updated_at: string
  }
  quantity: number
  guest_number?: number
  price: number
  total_price: number
  created_at: string
}

/**
 * GET /orders/active
 * Получить активные заказы текущего заведения
 *
 * Active orders are orders with status: draft, confirmed, preparing, ready
 */
export function useActiveOrders() {
  return useQuery<ApiOrder[], Error>({
    queryKey: ['orders', 'active'],
    queryFn: async (): Promise<ApiOrder[]> => {
      const response = await apiClient.get<ApiOrder[]>('/orders/active')
      return response.data
    },
    retry: false,
    throwOnError: false,
  })
}

/**
 * GET /orders
 * Получить все заказы с фильтрами
 */
export interface GetOrdersFilter {
  establishmentId?: string
  status?: string
  tableNumber?: number
  startDate?: string
  endDate?: string
}

export function useOrders(filter?: GetOrdersFilter) {
  return useQuery<ApiOrder[], Error>({
    queryKey: ['orders', 'list', filter],
    queryFn: async (): Promise<ApiOrder[]> => {
      const params = new URLSearchParams()
      if (filter?.establishmentId) params.append('establishment_id', filter.establishmentId)
      if (filter?.status) params.append('status', filter.status)
      if (filter?.tableNumber) params.append('table_number', filter.tableNumber.toString())
      if (filter?.startDate) params.append('start_date', filter.startDate)
      if (filter?.endDate) params.append('end_date', filter.endDate)

      const response = await apiClient.get<ApiOrder[]>(`/orders?${params.toString()}`)
      return response.data
    },
    enabled: !!filter?.establishmentId,
  })
}

/**
 * GET /orders/:order_id
 * Получить заказ по ID
 */
export function useOrder(orderId: string) {
  return useQuery<ApiOrder, Error>({
    queryKey: ['orders', orderId],
    queryFn: async (): Promise<ApiOrder> => {
      const response = await apiClient.get<ApiOrder>(`/orders/${orderId}`)
      return response.data
    },
    enabled: !!orderId,
  })
}

/**
 * POST /orders
 * Создать новый заказ
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (order: {
      establishmentId: string
      tableNumber?: number
      items: Array<{
        productId?: string
        techCardId?: string
        quantity: number
        price: number
        totalPrice: number
      }>
      totalAmount: number
      guestsCount?: number
    }) => {
      // Сначала сохраняем локально
      const localId = await db.orders.add({
        establishmentId: order.establishmentId,
        tableNumber: order.tableNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        guestsCount: order.guestsCount,
        status: 'pending',
        createdAt: new Date()
      })

      try {
        // Пытаемся отправить на сервер
        const response = await apiClient.post<ApiOrder>('/orders', {
          establishmentId: order.establishmentId,
          tableNumber: order.tableNumber,
          status: 'draft',
          totalAmount: order.totalAmount,
          guestsCount: order.guestsCount,
          items: order.items
        })

        // Обновляем статус
        await db.orders.update(localId, {
          serverId: response.data.id,
          status: 'synced',
          syncedAt: new Date()
        })

        return response.data
      } catch (error) {
        // Если офлайн - оставляем pending для фоновой синхронизации
        console.log('Offline: order saved locally')
        return { id: localId.toString(), ...order } as unknown as ApiOrder
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

/**
 * Трансформирует ApiOrder в формат Order (camelCase)
 */
export function transformApiOrderToOrder(apiOrder: ApiOrder): Order {
  return {
    id: apiOrder.id,
    establishmentId: apiOrder.establishment_id,
    establishment: apiOrder.establishment ? {
      id: apiOrder.establishment.id,
      ownerId: apiOrder.establishment.owner_id,
      name: apiOrder.establishment.name,
      address: apiOrder.establishment.address,
      phone: apiOrder.establishment.phone,
      email: apiOrder.establishment.email,
      type: apiOrder.establishment.type,
      hasSeatingPlaces: apiOrder.establishment.has_seating_places ?? false,
      tableCount: apiOrder.establishment.table_count,
      active: apiOrder.establishment.active ?? false,
      createdAt: apiOrder.establishment.created_at,
      updatedAt: apiOrder.establishment.updated_at,
    } : undefined,
    tableNumber: apiOrder.table_number,
    status: apiOrder.status as Order['status'],
    totalAmount: apiOrder.total_amount,
    guestsCount: apiOrder.guests_count,
    items: apiOrder.items?.map(item => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      product: item.product ? {
        id: item.product.id,
        establishmentId: item.product.establishment_id,
        categoryId: item.product.category_id,
        name: item.product.name,
        description: item.product.description,
        coverImage: item.product.cover_image,
        isWeighted: false,
        excludeFromDiscounts: false,
        hasModifications: false,
        costPrice: 0,
        markup: 0,
        price: item.product.price,
        active: item.product.active,
        createdAt: item.product.created_at,
        updatedAt: item.product.updated_at,
      } : undefined,
      techCardId: item.tech_card_id,
      techCard: item.tech_card ? {
        id: item.tech_card.id,
        establishmentId: item.tech_card.establishment_id,
        categoryId: item.tech_card.category_id,
        name: item.tech_card.name,
        description: item.tech_card.description,
        coverImage: item.tech_card.cover_image,
        isWeighted: false,
        excludeFromDiscounts: false,
        costPrice: 0,
        markup: 0,
        price: item.tech_card.price,
        active: item.tech_card.active,
        createdAt: item.tech_card.created_at,
        updatedAt: item.tech_card.updated_at,
      } : undefined,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.total_price,
      createdAt: item.created_at,
    })),
    createdAt: apiOrder.created_at,
    updatedAt: apiOrder.updated_at,
  }
}

/**
 * Хук для получения активных заказов в формате Order
 */
export function useActiveOrdersFormatted() {
  const { data, isLoading, error, refetch } = useActiveOrders()

  return {
    data: data?.map(transformApiOrderToOrder),
    isLoading,
    error,
    refetch,
  }
}
