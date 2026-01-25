import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetProducts,
  useGetCategories,
  useDeleteProduct,
  type ProductFilter,
} from '@restaurant-pos/api-client'
import type { ProductTable, ProductsSort, UseProductsResult } from '../model/types'
import { SortDirection } from '../model/enums'

export const useProducts = (): UseProductsResult => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<ProductsSort>({ field: 'name', direction: SortDirection.ASC })
  const [filters, setFilters] = useState<ProductFilter>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined)

  const { data: apiProducts = [], isLoading, error } = useGetProducts({
    ...filters,
    search: searchQuery || undefined,
  })

  const { data: categories = [] } = useGetCategories({ type: 'product' })

  const products = useMemo(() => {
    return apiProducts.map(
      (product): ProductTable => ({
        id: product.id,
        name: product.name,
        category: product.category?.name || '-',
        costPrice: product.cost_price,
        price: product.price,
        markup: product.markup > 0 ? product.markup : null,
        coverImage: product.cover_image,
      })
    )
  }, [apiProducts])

  const workshops = useMemo(() => {
    const uniqueWorkshops = new Map<string, { id: string; name: string }>()
    apiProducts.forEach((product) => {
      if (product.workshop_id && product.workshop) {
        uniqueWorkshops.set(product.workshop_id, {
          id: product.workshop_id,
          name: product.workshop.name,
        })
      }
    })
    return Array.from(uniqueWorkshops.values())
  }, [apiProducts])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    filtered.sort((a, b) => {
      let aValue: string | number = a[sort.field]
      let bValue: string | number = b[sort.field]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sort.direction === SortDirection.ASC ? comparison : -comparison
      }

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered
  }, [products, sort])

  const { mutateAsync: deleteProduct } = useDeleteProduct()

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: Partial<ProductFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const handleSort = (field: keyof ProductTable) => {
    setSort((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === SortDirection.ASC
          ? SortDirection.DESC
          : SortDirection.ASC,
    }))
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleEdit = (id: string) => {
    setEditingProductId(id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      await deleteProduct(id)
    }
  }

  const handleAdd = () => {
    setEditingProductId(undefined)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProductId(undefined)
  }

  const handleSuccess = useCallback(() => {
    setIsModalOpen(false)
    setEditingProductId(undefined)
  }, [])

  const handleExport = () => {
    console.log('Export products')
  }

  const handlePrint = () => {
    console.log('Print products')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  const handleCart = () => {
    console.log('Open cart')
  }

  return {
    products: filteredAndSortedProducts,
    isLoading,
    error: error as Error | null,
    searchQuery,
    filters,
    categories: categories.map((cat) => ({ id: cat.id, name: cat.name })),
    workshops,
    handleSearchChange,
    handleFilterChange,
    handleSort,
    handleBack,
    handleEdit,
    handleDelete,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    handleCart,
    sort,
    isModalOpen,
    editingProductId,
    handleCloseModal,
    handleSuccess,
  }
}

