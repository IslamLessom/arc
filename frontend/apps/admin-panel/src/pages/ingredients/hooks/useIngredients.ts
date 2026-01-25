import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetIngredients } from '@restaurant-pos/api-client'
import type { Ingredient, IngredientsFilter, IngredientsSort } from '../model/types'
import { MeasureUnit, SortField } from '../model/enums'

export const useIngredients = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<IngredientsFilter>({})
  const [sort, setSort] = useState<IngredientsSort>({
    field: 'name',
    direction: 'asc'
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null)

  const apiFilter = useMemo(() => ({
    search: searchQuery,
    category_id: filter.category,
  }), [searchQuery, filter.category])

  const { data: apiIngredients = [], isLoading, error } = useGetIngredients(apiFilter)

  const ingredients = useMemo(() => apiIngredients.map(api => ({
    id: api.id,
    name: api.name,
    category: api.category?.name || api.category_id,
    measureUnit: api.unit,
    count: 0,
    stock: 0,
    cost: 0,
    supplier: undefined,
    lastDelivery: undefined,
  })), [apiIngredients])

  const filteredAndSortedIngredients = useMemo(() => {
    let result = [...ingredients]

    // Apply supplier filter (not in API)
    if (filter.supplier) {
      result = result.filter(ingredient => ingredient.supplier === filter.supplier)
    }

    // Apply inStock filter
    if (filter.inStock !== undefined) {
      result = result.filter(ingredient =>
        filter.inStock ? ingredient.stock > 0 : ingredient.stock === 0
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sort.field]
      const bValue = b[sort.field]
      
      if (aValue === undefined || bValue === undefined) return 0
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [ingredients, searchQuery, filter, sort])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleSort = (field: keyof Ingredient) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilter = (newFilter: Partial<IngredientsFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleEdit = (id: string) => {
    setEditingIngredientId(id)
    setIsEditModalOpen(true)
  }

  const handleDelete = (id: string) => {
    // Implement delete logic
    console.log('Delete ingredient:', id)
  }

  const handleAdd = () => {
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingIngredientId(null)
  }

  const handleAddSuccess = () => {
    // Refresh ingredients list if needed
    // The query will be invalidated by the mutation
  }

  const handleEditSuccess = () => {
    // Refresh ingredients list if needed
    // The query will be invalidated by the mutation
  }

  const handleExport = () => {
    // Implement export logic
    console.log('Export ingredients')
  }

  const handlePrint = () => {
    // Implement print logic
    console.log('Print ingredients')
  }

  const handleColumns = () => {
    // Implement columns configuration
    console.log('Configure columns')
  }

  const totalIngredientCount = filteredAndSortedIngredients.length
  const totalStock = filteredAndSortedIngredients.reduce((sum, item) => sum + item.stock, 0)
  const totalValue = filteredAndSortedIngredients.reduce((sum, item) => sum + item.cost, 0)

  return {
    ingredients: filteredAndSortedIngredients,
    isLoading,
    error,
    searchQuery,
    filter,
    sort,
    totalIngredientCount,
    totalStock,
    totalValue,
    isAddModalOpen,
    isEditModalOpen,
    editingIngredientId,
    handleSearchChange,
    handleSort,
    handleFilter,
    handleBack,
    handleEdit,
    handleDelete,
    handleAdd,
    handleCloseAddModal,
    handleCloseEditModal,
    handleAddSuccess,
    handleEditSuccess,
    handleExport,
    handlePrint,
    handleColumns
  }
}