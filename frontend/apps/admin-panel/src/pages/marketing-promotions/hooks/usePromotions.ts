import { useState, useMemo } from 'react'
import { PromotionTable, PromotionsSort } from '../model/types'
import { SortDirection } from '../model/enums'

// Mock data - replace with actual API calls when available
const mockPromotions: PromotionTable[] = [
  {
    id: '1',
    name: 'Скидка 20% на все напитки',
    description: 'Скидка на все горячие и холодные напитки',
    type: 'discount',
    discount_percentage: 20,
    buy_quantity: null,
    get_quantity: null,
    start_date: '2024-02-01',
    end_date: '2024-02-28',
    is_active: true,
    usage_count: 156,
    number: 1,
    created_at: '2024-01-25',
    updated_at: '2024-02-10'
  },
  {
    id: '2',
    name: '2+1 на пиццу',
    description: 'Купите две пиццы, третья в подарок',
    type: 'buy_x_get_y',
    discount_percentage: null,
    buy_quantity: 2,
    get_quantity: 1,
    start_date: '2024-02-05',
    end_date: '2024-03-05',
    is_active: true,
    usage_count: 89,
    number: 2,
    created_at: '2024-01-28',
    updated_at: '2024-02-08'
  },
  {
    id: '3',
    name: 'Бизнес ланч',
    description: 'Комплексный обед по специальной цене',
    type: 'bundle',
    discount_percentage: null,
    buy_quantity: null,
    get_quantity: null,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    is_active: true,
    usage_count: 1245,
    number: 3,
    created_at: '2023-12-20',
    updated_at: '2024-02-05'
  },
  {
    id: '4',
    name: 'Happy Hour',
    description: 'Счастливые часы с 15:00 до 18:00',
    type: 'happy_hour',
    discount_percentage: 15,
    buy_quantity: null,
    get_quantity: null,
    start_date: '2024-02-10',
    end_date: '2024-04-10',
    is_active: false,
    usage_count: 0,
    number: 4,
    created_at: '2024-02-01',
    updated_at: '2024-02-10'
  }
]

export const usePromotions = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<PromotionsSort>({ field: 'name', direction: SortDirection.ASC })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null)

  // TODO: Replace with actual API calls
  // const { data: apiPromotions = [], isLoading, error } = useGetPromotions()
  const promotions: PromotionTable[] = mockPromotions
  const isLoading = false
  const error = null

  const filteredAndSortedPromotions = useMemo(() => {
    if (!promotions || promotions.length === 0) return []
    let filtered = promotions.filter(promotion => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        promotion.name.toLowerCase().includes(searchLower) ||
        (promotion.description && promotion.description.toLowerCase().includes(searchLower))

      return matchesSearch
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date | boolean = a[sort.field]
      let bValue: string | number | Date | boolean = b[sort.field]

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((promotion, index) => ({
      ...promotion,
      number: index + 1
    }))
  }, [promotions, searchQuery, sort])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof PromotionTable) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC
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

  const handleSuccess = () => {
    handleCloseModal()
  }

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
  }
}
