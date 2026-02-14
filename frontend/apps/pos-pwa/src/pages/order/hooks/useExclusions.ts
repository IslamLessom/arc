import { useMemo } from 'react'
import { useMarketingExclusions } from '@restaurant-pos/api-client'
import type { Product } from '@restaurant-pos/api-client'
import type { TechnicalCard } from '@restaurant-pos/api-client'
import type { OrderItem } from '../model/types'

export interface ExclusionCheckResult {
  isExcluded: boolean
  excludedItems: OrderItem[]
  eligibleItems: OrderItem[]
  eligibleAmount: number
}

/**
 * Хук для проверки исключений из скидок
 * Загружает маркетинговые исключения и предоставляет функции для проверки
 */
export function useExclusions() {
  const { exclusions, isLoading } = useMarketingExclusions()

  // Получаем активные исключения для товаров и категорий
  const activeExclusions = useMemo(() => {
    return exclusions.filter(e => e.active)
  }, [exclusions])

  // Проверяет, исключён ли товар по ID
  const isProductExcluded = useMemo(() => {
    const excludedProductIds = new Set(
      activeExclusions
        .filter(e => e.type === 'product' && e.entity_id)
        .map(e => e.entity_id!)
    )
    return (productId: string) => excludedProductIds.has(productId)
  }, [activeExclusions])

  // Проверяет, исключена ли категория по ID
  const isCategoryExcluded = useMemo(() => {
    const excludedCategoryIds = new Set(
      activeExclusions
        .filter(e => e.type === 'category' && e.entity_id)
        .map(e => e.entity_id!)
    )
    return (categoryId: string) => excludedCategoryIds.has(categoryId)
  }, [activeExclusions])

  // Проверяет, исключён ли товар (по ID товара или категории)
  const checkItemExcluded = useMemo(() => {
    return (item: OrderItem): boolean => {
      // Проверяем флаг exclude_from_discounts у самого товара
      if (item.itemType === 'product' && item.product?.exclude_from_discounts) {
        return true
      }
      // Проверяем флаг exclude_from_discounts у тех-карты
      if (item.itemType === 'tech_card' && item.techCard?.exclude_from_discounts) {
        return true
      }

      // Проверяем исключения по ID товара
      if (item.productId && isProductExcluded(item.productId)) {
        return true
      }

      // Проверяем исключения по ID категории
      const categoryId = item.product?.category_id || item.techCard?.category_id
      if (categoryId && isCategoryExcluded(categoryId)) {
        return true
      }

      return false
    }
  }, [isProductExcluded, isCategoryExcluded])

  // Разделяет товары на исключённые и участвующие в скидке
  const splitItemsByExclusion = useMemo(() => {
    return (items: OrderItem[]): ExclusionCheckResult => {
      const excludedItems: OrderItem[] = []
      const eligibleItems: OrderItem[] = []

      for (const item of items) {
        if (checkItemExcluded(item)) {
          excludedItems.push(item)
        } else {
          eligibleItems.push(item)
        }
      }

      const eligibleAmount = eligibleItems.reduce((sum, item) => sum + item.totalPrice, 0)

      return {
        isExcluded: excludedItems.length > 0,
        excludedItems,
        eligibleItems,
        eligibleAmount,
      }
    }
  }, [checkItemExcluded])

  // Вычисляет сумму скидки с учётом исключений
  const calculateDiscountWithExclusions = useMemo(() => {
    return (
      items: OrderItem[],
      discountType: 'percentage' | 'fixed',
      discountValue: number
    ): { discountAmount: number; excludedItems: OrderItem[] } => {
      const { excludedItems, eligibleAmount } = splitItemsByExclusion(items)

      let discountAmount = 0
      if (discountType === 'percentage') {
        discountAmount = (eligibleAmount * discountValue) / 100
      } else {
        // Для фиксированной скидки ограничиваем суммой eligible товаров
        discountAmount = Math.min(discountValue, eligibleAmount)
      }

      return { discountAmount, excludedItems }
    }
  }, [splitItemsByExclusion])

  // Проверяет все товары на исключения (для UI)
  const checkAllItemsExcluded = useMemo(() => {
    return (items: OrderItem[]): OrderItem[] => {
      return items.filter(checkItemExcluded)
    }
  }, [checkItemExcluded])

  return {
    exclusions: activeExclusions,
    isLoading,
    isProductExcluded,
    isCategoryExcluded,
    checkItemExcluded,
    splitItemsByExclusion,
    calculateDiscountWithExclusions,
    checkAllItemsExcluded,
  }
}
