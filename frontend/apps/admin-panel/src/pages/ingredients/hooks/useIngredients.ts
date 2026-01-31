import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetIngredients, useGetStock, useGetSuppliers, useGetSupplies } from '@restaurant-pos/api-client'
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
  const { data: stock = [] } = useGetStock({ type: 'ingredient' })
  const { data: suppliers = [] } = useGetSuppliers()
  const { data: supplies = [] } = useGetSupplies()

  // Создаём мапу ингредиент -> остатки на складах
  const stockByIngredient = useMemo(() => {
    const map = new Map<string, { quantity: number; value: number }>()
    stock.forEach(s => {
      if (s.ingredient_id) {
        const current = map.get(s.ingredient_id) || { quantity: 0, value: 0 }
        map.set(s.ingredient_id, {
          quantity: current.quantity + s.quantity,
          value: current.value + (s.quantity * s.price_per_unit)
        })
      }
    })
    return map
  }, [stock])

  // Создаём мапу ингредиент -> последняя поставка с поставщиком
  const lastSupplyByIngredient = useMemo(() => {
    const map = new Map<string, { supplierName: string; deliveryDate: string }>()

    supplies.forEach(supply => {
      supply.items?.forEach(item => {
        if (item.ingredient_id && !map.has(item.ingredient_id)) {
          const supplier = suppliers.find(s => s.id === supply.supplier_id)
          if (supplier) {
            map.set(item.ingredient_id, {
              supplierName: supplier.name,
              deliveryDate: supply.delivery_date_time
            })
          }
        }
      })
    })

    // Сортируем поставки по дате (самые поздние первые)
    const sortedSupplies = [...supplies].sort((a, b) =>
      new Date(b.delivery_date_time).getTime() - new Date(a.delivery_date_time).getTime()
    )

    sortedSupplies.forEach(supply => {
      supply.items?.forEach(item => {
        if (item.ingredient_id && !map.has(item.ingredient_id)) {
          const supplier = suppliers.find(s => s.id === supply.supplier_id)
          if (supplier) {
            map.set(item.ingredient_id, {
              supplierName: supplier.name,
              deliveryDate: supply.delivery_date_time
            })
          }
        }
      })
    })

    return map
  }, [supplies, suppliers])

  const ingredients = useMemo(() => apiIngredients.map(api => {
    const stockData = stockByIngredient.get(api.id)
    const supplyData = lastSupplyByIngredient.get(api.id)

    return {
      id: api.id,
      name: api.name,
      category: api.category?.name || api.category_id,
      measureUnit: api.unit,
      count: 1,
      stock: stockData?.quantity || 0,
      cost: stockData?.value || 0,
      supplier: supplyData?.supplierName,
      lastDelivery: supplyData?.deliveryDate ? new Date(supplyData.deliveryDate) : undefined,
    }
  }), [apiIngredients, stockByIngredient, lastSupplyByIngredient])

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