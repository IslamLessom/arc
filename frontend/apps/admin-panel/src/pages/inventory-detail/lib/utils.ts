import type { ExpressionParseResult, InventoryDetailItem, InventoryDetailStats } from '../model/types'
import type { InventoryItem } from '@restaurant-pos/api-client'

/**
 * Parse simple arithmetic expressions like "2+3", "10-2", "2.5*2", "10/2"
 */
export const parseQuantityExpression = (input: string): ExpressionParseResult => {
  if (!input || input.trim() === '') {
    return { value: 0 }
  }

  // First try to parse as a simple number
  const simpleNumber = parseFloat(input.replace(',', '.'))
  if (!isNaN(simpleNumber) && !isNaN(parseFloat(input))) {
    return { value: simpleNumber }
  }

  // Try to evaluate as a mathematical expression
  // Only allow numbers, spaces, and operators + - * /
  const sanitized = input.trim().replace(/[^0-9+\-*/.\s]/g, '')

  if (sanitized === '') {
    return { value: 0, error: 'Некорректное выражение' }
  }

  try {
    // Use Function constructor for safe evaluation (safer than eval)
    const result = new Function('return ' + sanitized)()

    if (typeof result !== 'number' || isNaN(result)) {
      return { value: 0, error: 'Некорректное выражение' }
    }

    // Round to 2 decimal places
    return { value: Math.round(result * 100) / 100 }
  } catch {
    return { value: 0, error: 'Некорректное выражение' }
  }
}

/**
 * Calculate difference between planned and actual quantity
 */
export const calculateDifference = (planned: number, actual: number): number => {
  return Math.round((actual - planned) * 100) / 100
}

/**
 * Calculate difference value in money
 */
export const calculateDifferenceValue = (
  difference: number,
  pricePerUnit: number
): number => {
  return Math.round(difference * pricePerUnit * 100) / 100
}

/**
 * Calculate item statistics from planned/actual values
 */
export const calculateItemStats = (
  planned: number,
  actual: number,
  pricePerUnit: number
): { difference: number; differenceValue: number } => {
  const difference = calculateDifference(planned, actual)
  const differenceValue = calculateDifferenceValue(difference, pricePerUnit)
  return { difference, differenceValue }
}

/**
 * Calculate total statistics for all items
 */
export const calculateTotalStats = (items: InventoryDetailItem[]): InventoryDetailStats => {
  return items.reduce(
    (stats, item) => {
      return {
        totalPlanned: stats.totalPlanned + item.planned_quantity,
        totalActual: stats.totalActual + item.actual_quantity,
        totalDifference: stats.totalDifference + item.difference,
        totalDifferenceValue: stats.totalDifferenceValue + item.difference_value,
      }
    },
    {
      totalPlanned: 0,
      totalActual: 0,
      totalDifference: 0,
      totalDifferenceValue: 0,
    }
  )
}

/**
 * Format number for display
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals).replace('.', ',')
}

/**
 * Format currency for display
 */
export const formatCurrency = (value: number): string => {
  return formatNumber(value, 2) + ' ₽'
}

/**
 * Get difference color based on value
 */
export const getDifferenceColor = (difference: number): string => {
  if (difference > 0) return '#10b981' // green - surplus
  if (difference < 0) return '#ef4444' // red - shortage
  return '#64748b' // gray - no difference
}

/**
 * Group items by type
 */
export const groupItemsByType = (
  items: InventoryDetailItem[]
): Record<string, InventoryDetailItem[]> => {
  return items.reduce((groups, item) => {
    const key = item.type
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<string, InventoryDetailItem[]>)
}

/**
 * Filter items by search query
 */
export const filterItemsBySearch = (
  items: InventoryDetailItem[],
  searchQuery: string
): InventoryDetailItem[] => {
  if (!searchQuery || searchQuery.trim() === '') {
    return items
  }

  const query = searchQuery.toLowerCase()
  return items.filter((item) => item.name.toLowerCase().includes(query))
}

/**
 * Update item quantity and recalculate derived fields
 */
export const updateItemQuantity = (
  items: InventoryDetailItem[],
  itemId: string,
  newQuantity: number
): InventoryDetailItem[] => {
  return items.map((item) => {
    if (item.id !== itemId) return item

    const stats = calculateItemStats(item.planned_quantity, newQuantity, item.price_per_unit)
    return {
      ...item,
      actual_quantity: newQuantity,
      ...stats,
    }
  })
}

/**
 * Convert inventory items to detail items format
 */
export const inventoryItemToDetailItem = (
  inventoryItem: InventoryItem
): InventoryDetailItem => {
  return {
    id: inventoryItem.id,
    inventory_item_id: inventoryItem.id,
    type: inventoryItem.type,
    ingredient_id: inventoryItem.ingredient_id,
    product_id: inventoryItem.product_id,
    tech_card_id: inventoryItem.tech_card_id,
    semi_finished_id: inventoryItem.semi_finished_id,
    name: '', // Will be filled from related data
    unit: inventoryItem.unit,
    price_per_unit: inventoryItem.price_per_unit,
    planned_quantity: inventoryItem.expected_quantity,
    income_quantity: 0,
    expense_quantity: 0,
    actual_quantity: inventoryItem.actual_quantity,
    difference: inventoryItem.difference,
    difference_value: inventoryItem.difference_value,
  }
}

/**
 * Get status label
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Черновик',
    in_progress: 'В процессе',
    completed: 'Завершена',
    cancelled: 'Отменена',
  }
  return labels[status] || status
}

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: '#64748b',
    in_progress: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
  }
  return colors[status] || '#64748b'
}

/**
 * Check if inventory can be edited
 */
export const canEditInventory = (status: string): boolean => {
  return status === 'draft' || status === 'in_progress'
}

/**
 * Check if inventory can be completed
 */
export const canCompleteInventory = (status: string): boolean => {
  return status === 'draft' || status === 'in_progress'
}

/**
 * Check if inventory can be reopened
 */
export const canReopenInventory = (status: string): boolean => {
  return status === 'completed'
}
