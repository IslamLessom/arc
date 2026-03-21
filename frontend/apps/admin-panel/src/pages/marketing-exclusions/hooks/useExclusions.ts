import { useMemo, useState } from 'react'
import { useMarketingExclusions, type MarketingExclusion } from '@restaurant-pos/api-client'
import { useGetProducts, useGetTechnicalCards } from '@restaurant-pos/api-client'
import { exportToExcel, printTable, useColumnVisibility } from '@restaurant-pos/ui'
import { ExclusionTable, ExclusionsSort } from '../model/types'
import { SortDirection } from '../model/enums'
import { getExclusionsTableColumns } from '../lib/constants'

const confirmDelete = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.confirm(`Вы уверены, что хотите удалить исключение с ID: ${id}?`)) {
      resolve(true)
    } else {
      resolve(false)
    }
  })
}

const normalizeExclusion = (exclusion: MarketingExclusion, number: number): ExclusionTable => ({
  id: exclusion.id,
  name: exclusion.name,
  description: exclusion.description ?? null,
  type: exclusion.type,
  entity_id: exclusion.entity_id,
  entity_name: exclusion.entity_name,
  is_active: exclusion.active,
  created_at: exclusion.created_at,
  updated_at: exclusion.updated_at,
  number,
  impact_preview: 'Точечное исключение',
  impacted_items_count: 0,
})

export const useExclusions = () => {
  const { exclusions: apiExclusions, isLoading, error, refetch, deleteExclusion } = useMarketingExclusions()
  const { data: products = [] } = useGetProducts({ active: true })
  const { data: techCards = [] } = useGetTechnicalCards({ active: true })

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<ExclusionsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [editingExclusionId, setEditingExclusionId] = useState<string | null>(null)

  const exclusions = useMemo(() => {
    return apiExclusions.map((exclusion, index) => {
      const base = normalizeExclusion(exclusion, index + 1)

      if (exclusion.type === 'product') {
        return {
          ...base,
          impact_preview: 'Исключен конкретный товар',
          impacted_items_count: exclusion.entity_id ? 1 : 0,
        }
      }

      if (exclusion.type === 'category') {
        const count = exclusion.entity_id
          ? products.filter((product) => product.category_id === exclusion.entity_id).length
          : 0

        return {
          ...base,
          impact_preview: 'Исключены все товары категории',
          impacted_items_count: count,
        }
      }

      if (exclusion.type === 'tech_card') {
        const count = exclusion.entity_id
          ? techCards.filter((card) => card.id === exclusion.entity_id).length
          : 0

        return {
          ...base,
          impact_preview: 'Исключена конкретная тех-карта',
          impacted_items_count: count,
        }
      }

      return base
    })
  }, [apiExclusions, products, techCards])

  const filteredAndSortedExclusions = useMemo(() => {
    if (!exclusions.length) return []

    const filtered = exclusions.filter((exclusion) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        exclusion.name.toLowerCase().includes(searchLower) ||
        (exclusion.description && exclusion.description.toLowerCase().includes(searchLower)) ||
        (exclusion.entity_name && exclusion.entity_name.toLowerCase().includes(searchLower))
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

    return filtered.map((exclusion, index) => ({
      ...exclusion,
      number: index + 1,
    }))
  }, [exclusions, searchQuery, sort])

  const handleSearchChange = (query: string) => setSearchQuery(query)

  const handleSort = (field: keyof ExclusionTable) => {
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
    setEditingExclusionId(id)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingExclusionId(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExclusionId(null)
  }

  const handleSuccess = async () => {
    await refetch()
    handleCloseModal()
  }

  const allColumns = useMemo(
    () => getExclusionsTableColumns({ onEdit: () => {}, onDelete: () => {} }),
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
    storageKey: 'admin-panel-marketing-exclusions-columns'
  })

  const handleExport = () => {
    exportToExcel(filteredAndSortedExclusions, visibleColumns, 'marketing-exclusions.xlsx')
  }

  const handlePrint = () => {
    printTable(filteredAndSortedExclusions, visibleColumns, 'Исключения', {
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
        await deleteExclusion(id)
        await refetch()
      } catch (err) {
        console.error('Failed to delete exclusion:', err)
      }
    }
  }

  return {
    exclusions: filteredAndSortedExclusions,
    totalExclusionsCount: exclusions.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen,
    editingExclusionId,
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
