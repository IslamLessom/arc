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
      // Вычисляем общую сумму из items
      const totalAmount = supply.items?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0
      
      // Задолженность = сумма, если статус не completed
      const debt = supply.status !== SupplyStatus.COMPLETED ? totalAmount : 0
      
      // Формируем список товаров
      const goodsNames = supply.items?.map(item => {
        if (item.ingredient) return item.ingredient.name
        if (item.product) return item.product.name
        return ''
      }).filter(Boolean).join(', ') || ''

      return {
        ...supply,
        number: 0, // Будет установлено при сортировке
        totalAmount,
        debt,
        goodsNames
      }
    })
  }, [apiSupplies])

  const filteredAndSortedSupplies = useMemo(() => {
    let filtered = supplies.filter(supply => {
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
      
      // Специальная обработка для даты
      if (sort.field === 'delivery_date_time') {
        aValue = new Date(a.delivery_date_time).getTime()
        bValue = new Date(b.delivery_date_time).getTime()
      }
      
      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1
      return 0
    })

    // Устанавливаем номера после сортировки
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
    navigate('/warehouse/balances')
  }

  const handleEdit = (id: string) => {
    navigate(`/warehouse/deliveries/${id}/edit`)
  }

  const handleDetails = (id: string) => {
    navigate(`/warehouse/deliveries/${id}`)
  }

  const handleAdd = () => {
    navigate('/warehouse/deliveries/add')
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
    handleDetails,
    handleAdd,
    handleExport,
    handlePrint,
    handleColumns,
    setWarehouseFilter,
    setSupplierFilter
  }
}

