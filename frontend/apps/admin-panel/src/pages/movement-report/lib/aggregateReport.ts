import type { Movement, MovementItem } from '@restaurant-pos/api-client'
import type { MovementReportItem } from '../model/types'

interface StockItem {
  id: string
  name: string
  type: 'ingredient' | 'product'
  unit: string
  quantity: number
  price_per_unit: number
}

export const aggregateMovementReport = (
  movements: Movement[],
  stockItems: StockItem[],
  startDate: string,
  endDate: string
): MovementReportItem[] => {
  const reportMap = new Map<string, MovementReportItem>()

  // Инициализируем отчет из текущих остатков
  stockItems.forEach((item) => {
    reportMap.set(item.id, {
      id: item.id,
      name: item.name,
      type: item.type,
      unit: item.unit,
      initialBalance: 0,
      initialAverageCost: 0,
      initialSum: 0,
      receipts: 0,
      expenses: 0,
      finalBalance: item.quantity,
      finalAverageCost: item.price_per_unit,
      finalSum: item.quantity * item.price_per_unit,
    })
  })

  // Обрабатываем движения за период
  movements.forEach((movement) => {
    const movementDate = new Date(movement.date_time)
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (movementDate < start || movementDate > end) {
      return
    }

    movement.items.forEach((item: MovementItem) => {
      const itemId = item.ingredient_id || item.product_id
      if (!itemId) return

      let reportItem = reportMap.get(itemId)
      if (!reportItem) {
        // Если товара нет в остатках, создаем новую запись
        reportItem = {
          id: itemId,
          name: 'Неизвестный товар',
          type: item.ingredient_id ? 'ingredient' : 'product',
          unit: item.unit,
          initialBalance: 0,
          initialAverageCost: 0,
          initialSum: 0,
          receipts: 0,
          expenses: 0,
          finalBalance: 0,
          finalAverageCost: 0,
          finalSum: 0,
        }
        reportMap.set(itemId, reportItem)
      }

      if (movement.type === 'supply') {
        reportItem.receipts += item.quantity
        reportItem.finalBalance += item.quantity
        // Обновляем среднюю себестоимость
        const totalCost =
          reportItem.finalBalance * reportItem.finalAverageCost +
          item.quantity * item.price_per_unit
        reportItem.finalAverageCost =
          reportItem.finalBalance > 0 ? totalCost / reportItem.finalBalance : 0
        reportItem.finalSum = reportItem.finalBalance * reportItem.finalAverageCost
      } else if (movement.type === 'write_off') {
        reportItem.expenses += item.quantity
        reportItem.finalBalance -= item.quantity
        reportItem.finalSum = reportItem.finalBalance * reportItem.finalAverageCost
      }
    })
  })

  // Вычисляем начальные значения (итоговые - поступления + расходы)
  reportMap.forEach((item) => {
    item.initialBalance = item.finalBalance - item.receipts + item.expenses
    if (item.initialBalance > 0) {
      item.initialAverageCost = item.finalAverageCost
      item.initialSum = item.initialBalance * item.initialAverageCost
    }
  })

  return Array.from(reportMap.values())
}

