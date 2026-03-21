// @ts-nocheck
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetSupplies, useGetWarehouses, useGetSuppliers } from '@restaurant-pos/api-client'
import { SupplyTable, SuppliesSort } from '../model/types'
import { SortDirection, SupplyStatus } from '../model/enums'

export const useSupplies = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SuppliesSort>({ field: 'delivery_date_time', direction: SortDirection.DESC })
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>()
  const [supplierFilter, setSupplierFilter] = useState<string | undefined>()

  const { data: apiSupplies = [], isLoading, error } = useGetSupplies({
    warehouse_id: warehouseFilter
  })
  const { data: warehouses = [] } = useGetWarehouses()
  const { data: suppliers = [] } = useGetSuppliers()

  const supplies = useMemo(() => {
    return apiSupplies.map((supply): SupplyTable => {
      const totalAmount = supply.items?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0

      let debt = 0
      const paymentStatus = supply.payment_status

      if (paymentStatus === 'debt' || paymentStatus === 'partial' || !paymentStatus || paymentStatus === 'none') {
        debt = totalAmount
      }

      const goodsNames = supply.items?.map(item => {
        if (item.ingredient) return item.ingredient.name
        if (item.product) return item.product.name
        return ''
      }).filter(Boolean).join(', ') || ''

      return {
        ...supply,
        number: 0,
        totalAmount,
        debt,
        goodsNames
      }
    })
  }, [apiSupplies])

  const filteredAndSortedSupplies = useMemo(() => {
    const filtered = supplies.filter(supply => {
      const matchesSearch =
        supply.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supply.warehouse?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supply.goodsNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supply.comment || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSupplier = !supplierFilter || supply.supplier_id === supplierFilter

      return matchesSearch && matchesSupplier
    })

    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sort.field]
      let bValue: string | number | Date = b[sort.field]

      if (sort.field === 'delivery_date_time') {
        aValue = new Date(a.delivery_date_time).getTime()
        bValue = new Date(b.delivery_date_time).getTime()
      }

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    return filtered.map((supply, index) => ({
      ...supply,
      number: index + 1
    }))
  }, [supplies, searchQuery, sort, supplierFilter])

  const totalAmount = filteredAndSortedSupplies.reduce((sum, supply) => sum + supply.totalAmount, 0)
  const totalDebt = filteredAndSortedSupplies.reduce((sum, supply) => sum + supply.debt, 0)

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (field: keyof SupplyTable) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC
    }))
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleEdit = (_id: string) => {
    // Редактирование доступно через модалку деталей
  }

  const handleAdd = () => {
    navigate('/supplies/add')
  }

  const handleExport = () => {
    console.log('Export supplies')
  }

  const handlePrint = () => {
    console.log('Print supplies')
  }

  const handleColumns = () => {
    console.log('Manage columns')
  }

  return {
    supplies: filteredAndSortedSupplies,
    isLoading,
    error,
    searchQuery,
    sort,
    warehouseFilter,
    supplierFilter,
    warehouses,
    suppliers,
    totalAmount,
    totalDebt,
    handleSearchChange,
    handleSort,
    handleBack,
    handleEdit,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    setWarehouseFilter,
    setSupplierFilter
  }
}
