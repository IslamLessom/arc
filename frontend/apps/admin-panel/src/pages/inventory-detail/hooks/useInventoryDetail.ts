import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useGetInventory,
  useUpdateInventory,
  useUpdateInventoryStatus,
  useGetIngredients,
  useGetProducts,
  useGetTechnicalCards,
  useGetSemiFinishedProducts,
  useGetWarehouses,
  useGetStock,
  type Inventory,
  type InventoryItem,
  type Stock,
  type Ingredient,
  type Product,
} from '@restaurant-pos/api-client'
import type {
  InventoryDetailItem,
  InventoryDetailFormData,
  InventoryDetailStats,
  InventoryTabType,
} from '../model/types'
import {
  inventoryItemToDetailItem,
  calculateTotalStats,
  filterItemsBySearch,
  updateItemQuantity,
  parseQuantityExpression,
  getStatusLabel,
  getStatusColor,
  canEditInventory,
  canCompleteInventory,
  canReopenInventory,
} from '../lib/utils'

interface UseInventoryDetailResult {
  formData: InventoryDetailFormData
  isLoading: boolean
  isSaving: boolean
  error: string | null
  activeTab: InventoryTabType
  searchQuery: string
  filteredItems: InventoryDetailItem[]
  stats: InventoryDetailStats
  isReadOnly: boolean
  canComplete: boolean
  canReopen: boolean
  statusLabel: string
  statusColor: string
  completionAttempted: boolean
  validationErrors: Set<string>
  setActiveTab: (tab: InventoryTabType) => void
  setSearchQuery: (query: string) => void
  handleQuantityChange: (itemId: string, value: string) => void
  handleBlurQuantity: (itemId: string) => void
  handleBack: () => void
  handleComplete: () => void
  handleReopen: () => void
  handleSave: () => Promise<void>
  handleCommentChange: (comment: string) => void
}

const getDefaultFormData = (): InventoryDetailFormData => {
  return {
    warehouse_id: '',
    type: 'full',
    status: 'draft',
    comment: '',
    items: [],
  }
}

export const useInventoryDetail = (): UseInventoryDetailResult => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [activeTab, setActiveTab] = useState<InventoryTabType>('ingredients')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState<InventoryDetailFormData>(getDefaultFormData)
  const [editedItems, setEditedItems] = useState<Set<string>>(new Set())
  const [completionAttempted, setCompletionAttempted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())

  const { data: inventory, isLoading, error } = useGetInventory(id)
  const { data: warehouses = [] } = useGetWarehouses()
  const { data: ingredients = [] } = useGetIngredients({ active: true })
  const { data: products = [] } = useGetProducts({ active: true })
  const { data: techCards = [] } = useGetTechnicalCards()
  const { data: semiFinished = [] } = useGetSemiFinishedProducts()
  const { data: stock = [] } = useGetStock({ warehouse_id: inventory?.warehouse_id })

  const updateInventoryMutation = useUpdateInventory()
  const updateStatusMutation = useUpdateInventoryStatus()

  // Load inventory data
  useEffect(() => {
    if (inventory) {
      const warehouse = warehouses.find((w) => w.id === inventory.warehouse_id)

      console.log('Loading inventory:', {
        id: inventory.id,
        itemsCount: inventory.items?.length || 0,
        stockCount: stock?.length || 0,
        type: inventory.type,
        status: inventory.status,
      })

      let items: InventoryDetailItem[] = []

      // If inventory has items, use them. Otherwise, create items from stock for full inventory
      if (inventory.items && inventory.items.length > 0) {
        items = inventory.items.map((item) => {
          let name = ''
          let pricePerUnit = item.price_per_unit

          if (item.ingredient_id) {
            const ing = ingredients.find((i) => i.id === item.ingredient_id)
            name = ing?.name || ''
            pricePerUnit = item.price_per_unit
          } else if (item.product_id) {
            const prod = products.find((p) => p.id === item.product_id)
            name = prod?.name || ''
            pricePerUnit = item.price_per_unit
          } else if (item.tech_card_id) {
            const tc = techCards.find((t) => t.id === item.tech_card_id)
            name = tc?.name || ''
          } else if (item.semi_finished_id) {
            const sf = semiFinished.find((s) => s.id === item.semi_finished_id)
            name = sf?.name || ''
          }

          return {
            ...inventoryItemToDetailItem(item),
            name,
            price_per_unit: pricePerUnit,
          }
        })
      } else if (inventory.type === 'full' && stock && stock.length > 0) {
        // Create items from stock for full inventory
        console.log('Creating items from stock:', stock.length)
        items = stock.map((stockItem: Stock) => {
          const type = stockItem.ingredient_id
            ? 'ingredient'
            : stockItem.product_id
              ? 'product'
              : 'ingredient'

          let name = ''
          let pricePerUnit = stockItem.price_per_unit

          if (stockItem.ingredient_id) {
            const ing = ingredients.find((i) => i.id === stockItem.ingredient_id)
            name = ing?.name || stockItem.ingredient?.name || ''
          } else if (stockItem.product_id) {
            const prod = products.find((p) => p.id === stockItem.product_id)
            name = prod?.name || stockItem.product?.name || ''
          }

          return {
            id: crypto.randomUUID(),
            inventory_item_id: undefined,
            type,
            ingredient_id: stockItem.ingredient_id || undefined,
            product_id: stockItem.product_id || undefined,
            tech_card_id: undefined,
            semi_finished_id: undefined,
            name,
            unit: stockItem.unit,
            price_per_unit: pricePerUnit,
            planned_quantity: stockItem.quantity,
            income_quantity: 0,
            expense_quantity: 0,
            actual_quantity: 0,
            difference: -stockItem.quantity,
            difference_value: -stockItem.quantity * pricePerUnit,
          }
        })
      }

      setFormData({
        inventory_id: inventory.id,
        warehouse_id: inventory.warehouse_id,
        warehouse_name: warehouse?.name,
        type: inventory.type,
        status: inventory.status,
        scheduled_date: inventory.scheduled_date,
        actual_date: inventory.actual_date,
        comment: inventory.comment || '',
        items,
      })

      // Initialize editedItems with items that have actual_quantity already set
      const itemsWithValues = items
        .filter((item) => item.actual_quantity !== 0 && item.actual_quantity !== undefined && item.actual_quantity !== null)
        .map((item) => item.id)
      setEditedItems(new Set(itemsWithValues))

      console.log('Loaded items:', items.length, 'Edited items:', itemsWithValues.length)
    }
  }, [inventory, ingredients, products, techCards, semiFinished, warehouses, stock])

  const isReadOnly = !canEditInventory(formData.status)
  const canComplete = canCompleteInventory(formData.status)
  const canReopen = canReopenInventory(formData.status)
  const statusLabel = getStatusLabel(formData.status)
  const statusColor = getStatusColor(formData.status)

  // Filter items by tab type and search query
  const filteredItems = useMemo(() => {
    let items = formData.items || []

    // Filter by tab
    if (activeTab === 'ingredients') {
      items = items.filter((item) => item.type === 'ingredient' || item.type === 'product')
    } else {
      items = items.filter((item) => item.type === 'tech_card' || item.type === 'semi_finished')
    }

    // Filter by search query
    items = filterItemsBySearch(items, searchQuery)

    return items
  }, [formData.items, activeTab, searchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateTotalStats(filteredItems)
  }, [filteredItems])

  const handleQuantityChange = useCallback((itemId: string, value: string) => {
    setEditedItems((prev) => new Set([...prev, itemId]))

    // Clear validation error for this item when user starts editing
    setValidationErrors((prev) => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })

    // Try to parse expression
    const result = parseQuantityExpression(value)

    if (!result.error) {
      setFormData((prev) => ({
        ...prev,
        items: updateItemQuantity(prev.items, itemId, result.value),
      }))
    }
    // If there's an error, we don't update the value yet
    // The error will be shown when the user blurs the field
  }, [])

  const handleBlurQuantity = useCallback(
    (itemId: string) => {
      // This function can be used for additional blur handling if needed
      // Currently, validation is triggered by completion attempt
    },
    []
  )

  const handleBack = useCallback(() => {
    navigate('/warehouse/inventories')
  }, [navigate])

  const handleComplete = useCallback(async () => {
    if (!formData.inventory_id) return

    // Validate all items have been edited (have actual_quantity filled)
    const uneditedItems = (formData.items || []).filter((item) => !editedItems.has(item.id))

    if (uneditedItems.length > 0) {
      // Show validation errors
      setCompletionAttempted(true)
      setValidationErrors(new Set(uneditedItems.map((item) => item.id)))
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: formData.inventory_id,
        status: 'completed',
      })
    } catch (err) {
      console.error('Failed to complete inventory:', err)
    }
  }, [formData.inventory_id, formData.items, editedItems, updateStatusMutation])

  const handleReopen = useCallback(async () => {
    if (!formData.inventory_id) return

    try {
      await updateStatusMutation.mutateAsync({
        id: formData.inventory_id,
        status: 'in_progress',
      })
    } catch (err) {
      console.error('Failed to reopen inventory:', err)
    }
  }, [formData.inventory_id, updateStatusMutation])

  const handleSave = useCallback(async () => {
    if (!formData.inventory_id) return

    // Don't save if items are not loaded yet
    if (!formData.items || formData.items.length === 0) {
      console.log('Skipping save - no items')
      return
    }

    try {
      const items = formData.items.map((item) => ({
        type: item.type,
        ingredient_id: item.ingredient_id,
        product_id: item.product_id,
        tech_card_id: item.tech_card_id,
        semi_finished_id: item.semi_finished_id,
        actual_quantity: item.actual_quantity,
      }))

      console.log('Saving inventory:', {
        id: formData.inventory_id,
        itemsCount: items.length,
        items: items.slice(0, 3), // Log first 3 items for debugging
      })

      await updateInventoryMutation.mutateAsync({
        id: formData.inventory_id,
        data: {
          warehouse_id: formData.warehouse_id,
          type: formData.type,
          scheduled_date: formData.scheduled_date,
          comment: formData.comment,
          items,
        },
      })
    } catch (err) {
      console.error('Failed to save inventory:', err)
      // Don't throw - let the component handle the error silently
    }
  }, [formData, updateInventoryMutation])

  const handleCommentChange = useCallback((comment: string) => {
    setFormData((prev) => ({ ...prev, comment }))
  }, [])

  return {
    formData,
    isLoading: isLoading || !inventory,
    isSaving: updateInventoryMutation.isPending || updateStatusMutation.isPending,
    error: (error as Error | null)?.message || null,
    activeTab,
    searchQuery,
    filteredItems,
    stats,
    isReadOnly,
    canComplete,
    canReopen,
    statusLabel,
    statusColor,
    completionAttempted,
    validationErrors,
    setActiveTab,
    setSearchQuery,
    handleQuantityChange,
    handleBlurQuantity,
    handleBack,
    handleComplete,
    handleReopen,
    handleSave,
    handleCommentChange,
  }
}
