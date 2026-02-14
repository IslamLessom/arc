import { useMemo, useState } from 'react'
import { useMarketingExclusions, type MarketingExclusion } from '@restaurant-pos/api-client'
import { ExclusionTable, ExclusionsSort } from '../model/types'
import { SortDirection } from '../model/enums'

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
})

export const useExclusions = () => {
  const { exclusions: apiExclusions, isLoading, error, refetch, deleteExclusion } = useMarketingExclusions()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<ExclusionsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExclusionId, setEditingExclusionId] = useState<string | null>(null)

  const exclusions = useMemo(
    () => apiExclusions.map((exclusion, index) => normalizeExclusion(exclusion, index + 1)),
    [apiExclusions]
  )

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

  const handleExport = () => {
    console.log('Export exclusions')
  }

  const handlePrint = () => {
    console.log('Print exclusions')
  }

  const handleColumns = () => {
    console.log('Manage columns')
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
  }
}
