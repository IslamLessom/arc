import { useMemo, useState } from 'react'
import {
  useMarketingPromotions,
  type MarketingPromotion,
  type MarketingPromotionType,
} from '@restaurant-pos/api-client'
import { PromotionTable, PromotionsSort } from '../model/types'
import { SortDirection } from '../model/enums'

const PROMOTION_TYPES: MarketingPromotionType[] = ['discount', 'buy_x_get_y', 'bundle', 'happy_hour']

const toISODate = (date: Date) => date.toISOString().slice(0, 10)

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const normalizePromotion = (promotion: MarketingPromotion, number: number): PromotionTable => ({
  id: promotion.id,
  name: promotion.name,
  description: promotion.description ?? null,
  type: promotion.type,
  discount_percentage: promotion.discount_percentage ?? null,
  buy_quantity: promotion.buy_quantity ?? null,
  get_quantity: promotion.get_quantity ?? null,
  start_date: promotion.start_date,
  end_date: promotion.end_date,
  is_active: promotion.active,
  usage_count: promotion.usage_count ?? 0,
  created_at: promotion.created_at,
  updated_at: promotion.updated_at,
  number,
})

export const usePromotions = () => {
  const { promotions: apiPromotions, isLoading, error, createPromotion, updatePromotion } = useMarketingPromotions()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<PromotionsSort>({ field: 'name', direction: SortDirection.ASC })

  const promotions = useMemo(
    () => apiPromotions.map((promotion, index) => normalizePromotion(promotion, index + 1)),
    [apiPromotions]
  )

  const filteredAndSortedPromotions = useMemo(() => {
    if (!promotions.length) return []

    const filtered = promotions.filter((promotion) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        promotion.name.toLowerCase().includes(searchLower) ||
        (promotion.description && promotion.description.toLowerCase().includes(searchLower))
      )
    })

    filtered.sort((a, b) => {
      const aValue: string | number | Date | boolean | null | undefined = a[sort.field]
      const bValue: string | number | Date | boolean | null | undefined = b[sort.field]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sort.direction === SortDirection.ASC ? -1 : 1
      if (bValue == null) return sort.direction === SortDirection.ASC ? 1 : -1

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((promotion, index) => ({
      ...promotion,
      number: index + 1,
    }))
  }, [promotions, searchQuery, sort])

  const handleSearchChange = (query: string) => setSearchQuery(query)

  const handleSort = (field: keyof PromotionTable) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === SortDirection.ASC
          ? SortDirection.DESC
          : SortDirection.ASC,
    }))
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleEdit = async (id: string) => {
    const current = apiPromotions.find((item) => item.id === id)
    if (!current) return

    const nextName = window.prompt('Название акции', current.name)
    if (nextName === null) return

    const nextDescription = window.prompt('Описание акции', current.description ?? '')
    if (nextDescription === null) return

    const nextActive = window.confirm('Сделать акцию активной? Нажмите Отмена, чтобы деактивировать.')

    try {
      await updatePromotion(id, {
        name: nextName.trim() || current.name,
        description: nextDescription.trim() || undefined,
        type: current.type,
        discount_percentage: current.discount_percentage ?? undefined,
        buy_quantity: current.buy_quantity ?? undefined,
        get_quantity: current.get_quantity ?? undefined,
        start_date: current.start_date,
        end_date: current.end_date,
        active: nextActive,
      })
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : 'Не удалось обновить акцию')
    }
  }

  const handleAdd = async () => {
    const name = window.prompt('Название акции')
    if (!name || !name.trim()) return

    const typeInput = window.prompt(
      'Тип акции: discount | buy_x_get_y | bundle | happy_hour',
      'discount'
    )
    const type = (typeInput ?? 'discount') as MarketingPromotionType

    if (!PROMOTION_TYPES.includes(type)) {
      alert('Некорректный тип акции')
      return
    }

    const description = window.prompt('Описание акции (необязательно)', '')
    if (description === null) return

    const today = new Date()
    const startDate = window.prompt('Дата начала (YYYY-MM-DD)', toISODate(today))
    if (!startDate) return

    const endDate = window.prompt('Дата окончания (YYYY-MM-DD)', toISODate(addDays(today, 30)))
    if (!endDate) return

    const discountInput =
      type === 'discount' || type === 'happy_hour'
        ? window.prompt('Скидка (%)', '10')
        : null

    const buyInput = type === 'buy_x_get_y' ? window.prompt('Количество купить (X)', '2') : null
    const getInput = type === 'buy_x_get_y' ? window.prompt('Количество получить (Y)', '1') : null

    try {
      await createPromotion({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        discount_percentage: discountInput ? Number(discountInput) : undefined,
        buy_quantity: buyInput ? Number(buyInput) : undefined,
        get_quantity: getInput ? Number(getInput) : undefined,
        start_date: startDate,
        end_date: endDate,
      })
    } catch (createError) {
      alert(createError instanceof Error ? createError.message : 'Не удалось создать акцию')
    }
  }

  const handleCloseModal = () => undefined
  const handleSuccess = () => undefined

  const handleExport = () => {
    console.log('Export promotions')
  }

  const handlePrint = () => {
    console.log('Print promotions')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    promotions: filteredAndSortedPromotions,
    totalPromotionsCount: promotions.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen: false,
    editingPromotionId: null,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleAdd,
    handleCloseModal,
    handleSuccess,
    handleExport,
    handlePrint,
    handleColumns,
  }
}
