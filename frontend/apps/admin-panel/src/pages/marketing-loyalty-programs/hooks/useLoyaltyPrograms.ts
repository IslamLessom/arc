import { useMemo, useState } from 'react'
import {
  useMarketingLoyaltyPrograms,
  type MarketingLoyaltyProgram,
  type MarketingLoyaltyProgramType,
} from '@restaurant-pos/api-client'
import { LoyaltyProgramTable, LoyaltyProgramsSort } from '../model/types'
import { SortDirection } from '../model/enums'

const LOYALTY_TYPES: MarketingLoyaltyProgramType[] = ['points', 'cashback', 'tier']

const normalizeProgram = (program: MarketingLoyaltyProgram, number: number): LoyaltyProgramTable => ({
  id: program.id,
  name: program.name,
  description: program.description ?? null,
  type: program.type,
  points_per_currency: program.points_per_currency ?? null,
  cashback_percentage: program.cashback_percentage ?? null,
  max_cashback_amount: program.max_cashback_amount ?? null,
  point_multiplier: program.point_multiplier,
  is_active: program.active,
  members_count: program.members_count ?? 0,
  created_at: program.created_at,
  updated_at: program.updated_at,
  number,
})

export const useLoyaltyPrograms = () => {
  const {
    loyaltyPrograms: apiPrograms,
    isLoading,
    error,
    createLoyaltyProgram,
    updateLoyaltyProgram,
  } = useMarketingLoyaltyPrograms()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<LoyaltyProgramsSort>({ field: 'name', direction: SortDirection.ASC })

  const loyaltyPrograms = useMemo(
    () => apiPrograms.map((program, index) => normalizeProgram(program, index + 1)),
    [apiPrograms]
  )

  const filteredAndSortedPrograms = useMemo(() => {
    if (!loyaltyPrograms.length) return []

    const filtered = loyaltyPrograms.filter((program) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        program.name.toLowerCase().includes(searchLower) ||
        (program.description && program.description.toLowerCase().includes(searchLower))
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

    return filtered.map((program, index) => ({
      ...program,
      number: index + 1,
    }))
  }, [loyaltyPrograms, searchQuery, sort])

  const handleSearchChange = (query: string) => setSearchQuery(query)

  const handleSort = (field: keyof LoyaltyProgramTable) => {
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
    const current = apiPrograms.find((item) => item.id === id)
    if (!current) return

    const nextName = window.prompt('Название программы лояльности', current.name)
    if (nextName === null) return

    const nextDescription = window.prompt('Описание программы', current.description ?? '')
    if (nextDescription === null) return

    const nextActive = window.confirm('Сделать программу активной? Нажмите Отмена, чтобы деактивировать.')

    try {
      await updateLoyaltyProgram(id, {
        name: nextName.trim() || current.name,
        description: nextDescription.trim() || undefined,
        type: current.type,
        points_per_currency: current.points_per_currency ?? undefined,
        cashback_percentage: current.cashback_percentage ?? undefined,
        max_cashback_amount: current.max_cashback_amount ?? undefined,
        point_multiplier: current.point_multiplier,
        active: nextActive,
      })
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : 'Не удалось обновить программу лояльности')
    }
  }

  const handleAdd = async () => {
    const name = window.prompt('Название программы лояльности')
    if (!name || !name.trim()) return

    const typeInput = window.prompt('Тип программы: points | cashback | tier', 'points')
    const type = (typeInput ?? 'points') as MarketingLoyaltyProgramType

    if (!LOYALTY_TYPES.includes(type)) {
      alert('Некорректный тип программы')
      return
    }

    const description = window.prompt('Описание программы (необязательно)', '')
    if (description === null) return

    const pointMultiplierInput = window.prompt('Мультипликатор баллов', '1')
    if (!pointMultiplierInput) return

    const pointsInput = type === 'points' ? window.prompt('Баллов на единицу валюты', '1') : null
    const cashbackInput = type === 'cashback' ? window.prompt('Кэшбэк (%)', '5') : null
    const maxCashbackInput = type === 'cashback' ? window.prompt('Максимум кэшбэка', '0') : null

    try {
      await createLoyaltyProgram({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        points_per_currency: pointsInput ? Number(pointsInput) : undefined,
        cashback_percentage: cashbackInput ? Number(cashbackInput) : undefined,
        max_cashback_amount: maxCashbackInput ? Number(maxCashbackInput) : undefined,
        point_multiplier: Number(pointMultiplierInput),
      })
    } catch (createError) {
      alert(createError instanceof Error ? createError.message : 'Не удалось создать программу лояльности')
    }
  }

  const handleCloseModal = () => undefined
  const handleSuccess = () => undefined

  const handleExport = () => {
    console.log('Export loyalty programs')
  }

  const handlePrint = () => {
    console.log('Print loyalty programs')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    loyaltyPrograms: filteredAndSortedPrograms,
    totalProgramsCount: loyaltyPrograms.length,
    isLoading,
    error,
    searchQuery,
    sort,
    isModalOpen: false,
    editingProgramId: null,
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
