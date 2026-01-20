import { db, LocalOrder } from './db'

export class SyncManager {
  private syncInterval: NodeJS.Timeout | null = null
  
  async syncPendingOrders() {
    const pendingOrders = await db.orders
      .where('status')
      .equals('pending')
      .toArray()
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            establishmentId: order.establishmentId,
            tableNumber: order.tableNumber,
            status: 'draft',
            totalAmount: order.totalAmount,
            items: order.items.map(item => ({
              productId: item.productId,
              techCardId: item.techCardId,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.totalPrice
            }))
          })
        })
        
        if (response.ok) {
          const { id } = await response.json()
          await db.orders.update(order.id!, {
            serverId: id,
            status: 'synced',
            syncedAt: new Date()
          })
        }
      } catch (error) {
        console.error('Sync failed:', error)
        await db.orders.update(order.id!, { status: 'failed' })
      }
    }
  }
  
  startAutoSync(intervalMs = 30000) {
    this.syncInterval = setInterval(() => {
      this.syncPendingOrders()
    }, intervalMs)
  }
  
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export const syncManager = new SyncManager()

