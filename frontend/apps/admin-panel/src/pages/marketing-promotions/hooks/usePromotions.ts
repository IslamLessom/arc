import { useMemo, useState } from 'react'
import { useMarketingPromotions, type MarketingPromotion } from '@restaurant-pos/api-client'
import { exportToExcel, printTable, useColumnVisibility } from '@restaurant-pos/ui'
import { PromotionTable, PromotionsSort } from '../model/types'
import { SortDirection } from '../model/enums'
import { getPromotionsTableColumns } from '../lib/constants'

const confirmDelete = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.confirm(`Вы уверены, что хотите удалить акцию с ID: ${id}?`)) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
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
  impact_preview:
    promotion.type === 'discount'
      ? `Скидка ${promotion.discount_percentage ?? 0}% на участвующие позиции`
      : promotion.type === 'buy_x_get_y'
        ? `Купи ${promotion.buy_quantity ?? 0} - получи ${promotion.get_quantity ?? 0}`
        : promotion.type === 'happy_hour'
          ? `Скидка ${promotion.discount_percentage ?? 0}% в период акции`
          : 'Фиксированное комбо-предложение',
})

export const usePromotions = () => {
  const { promotions: apiPromotions, isLoading, error, refetch, deletePromotion } = useMarketingPromotions()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<PromotionsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null)

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

  const handleEdit = (id: string) => {
    setEditingPromotionId(id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingPromotionId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPromotionId(null)
  }

  const handleSuccess = async () => {
    await refetch()
    handleCloseModal()
  }

  const allColumns = useMemo(
    () => getPromotionsTableColumns({ onEdit: () => {}, onDelete: () => {} }),
    []
  )

  const {
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility,
  } = useColumnVisibility(allColumns, {
    storageKey: 'admin-panel-marketing-promotions-columns'
  })

  const handleExport = () => {
    exportToExcel(filteredAndSortedPromotions, visibleColumns, 'marketing-promotions.xlsx')
  }

  const handlePrint = () => {
    printTable(filteredAndSortedPromotions, visibleColumns, 'Акции', {
      showDate: true,
      orientation: 'landscape'
    })
  }

  const handleColumns = () => {
    setIsColumnModalOpen(true)
  }

  const handleCloseColumnModal = () => {
    setIsColumnModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete(id)
    if (confirmed) {
      try {
        await deletePromotion(id)
        await refetch()
      } catch (err) {
        console.error('Failed to delete promotion:', err)
      }
    }
  }

  return {
    promotions: filteredAndSortedPromotions,
    totalPromotionsCount: promotions.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen,
    editingPromotionId,
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
    handleDelete,
    isColumnModalOpen,
    handleCloseColumnModal,
    visibleColumns,
    columnInfo,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetColumnVisibility,
  }
}
