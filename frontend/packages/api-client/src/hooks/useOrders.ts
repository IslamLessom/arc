import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { db } from '@restaurant-pos/pwa-core'
import type { Order } from '@restaurant-pos/types'

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
    }) => {
      // Сначала сохраняем локально
      const localId = await db.orders.add({
        establishmentId: order.establishmentId,
        tableNumber: order.tableNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        status: 'pending',
        createdAt: new Date()
      })
      
      try {
        // Пытаемся отправить на сервер
        const response = await apiClient.post<Order>('/orders', {
          establishmentId: order.establishmentId,
          tableNumber: order.tableNumber,
          status: 'draft',
          totalAmount: order.totalAmount,
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
        return { id: localId.toString(), ...order } as Order
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

