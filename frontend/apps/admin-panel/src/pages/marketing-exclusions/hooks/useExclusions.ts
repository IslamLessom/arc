import { useMemo, useState } from 'react'
import {
  useMarketingExclusions,
  type MarketingExclusion,
  type MarketingExclusionType,
} from '@restaurant-pos/api-client'
import { ExclusionTable, ExclusionsSort } from '../model/types'
import { SortDirection } from '../model/enums'

const EXCLUSION_TYPES: MarketingExclusionType[] = ['product', 'category', 'customer', 'customer_group']

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
  const { exclusions: apiExclusions, isLoading, error, createExclusion, updateExclusion } = useMarketingExclusions()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<ExclusionsSort>({ field: 'name', direction: SortDirection.ASC })

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

  const handleEdit = async (id: string) => {
    const current = apiExclusions.find((item) => item.id === id)
    if (!current) return

    const nextName = window.prompt('Название исключения', current.name)
    if (nextName === null) return

    const nextDescription = window.prompt('Описание исключения', current.description ?? '')
    if (nextDescription === null) return

    const nextEntityName = window.prompt('Название объекта исключения', current.entity_name ?? '')
    if (nextEntityName === null) return

    const nextActive = window.confirm('Сделать исключение активным? Нажмите Отмена, чтобы деактивировать.')

    try {
      await updateExclusion(id, {
        name: nextName.trim() || current.name,
        description: nextDescription.trim() || undefined,
        type: current.type,
        entity_id: current.entity_id,
        entity_name: nextEntityName.trim() || undefined,
        active: nextActive,
      })
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : 'Не удалось обновить исключение')
    }
  }

  const handleAdd = async () => {
    const name = window.prompt('Название исключения')
    if (!name || !name.trim()) return

    const typeInput = window.prompt(
      'Тип исключения: product | category | customer | customer_group',
      'category'
    )
    const type = (typeInput ?? 'category') as MarketingExclusionType

    if (!EXCLUSION_TYPES.includes(type)) {
      alert('Некорректный тип исключения')
      return
    }

    const description = window.prompt('Описание исключения (необязательно)', '')
    if (description === null) return

    const entityName = window.prompt('Название объекта (необязательно)', '')
    if (entityName === null) return

    try {
      await createExclusion({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        entity_name: entityName.trim() || undefined,
      })
    } catch (createError) {
      alert(createError instanceof Error ? createError.message : 'Не удалось создать исключение')
    }
  }

  const handleCloseModal = () => undefined
  const handleSuccess = () => undefined

  const handleExport = () => {
    console.log('Export exclusions')
  }

  const handlePrint = () => {
    console.log('Print exclusions')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    exclusions: filteredAndSortedExclusions,
    totalExclusionsCount: exclusions.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen: false,
    editingExclusionId: null,
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
