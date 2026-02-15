import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  useCreateInventory,
  useUpdateInventory,
  useGetWarehouses,
  useGetInventory,
  useGetStock,
  useGetIngredients,
  useGetProducts,
  useGetIngredientCategories,
  useGetCategories,
  useGetTechnicalCards,
  useGetSemiFinishedProducts,
  type Stock,
  type Ingredient,
  type Product,
  type Inventory,
} from '@restaurant-pos/api-client'

import { generateUUID } from '../../../shared/utils/uuid'

import type {
  AddInventoryModalProps,
  UseAddInventoryModalResult,
  AddInventoryFormData,
  InventoryFormItem,
  ProductTreeNode,
} from '../model/types'

const getDefaultDateTime = () => {
  const now = new Date()
  return {
    date: now.toISOString().split('T')[0],
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  }
}

const getDefaultFormData = (): AddInventoryFormData => {
  const defaultDateTime = getDefaultDateTime()
  return {
    warehouse_id: '',
    checkType: 'at_time',
    date: defaultDateTime.date,
    time: defaultDateTime.time,
    type: 'full',
    comment: '',
    items: [],
  }
}

const stockItemToFormItem = (
  stockItem: Stock,
  itemType?: 'ingredient' | 'product' | 'tech_card' | 'semi_finished',
  itemId?: string
): InventoryFormItem => {
  const type = itemType
    ? itemType
    : stockItem.ingredient_id
      ? 'ingredient'
      : stockItem.product_id
        ? 'product'
        : 'ingredient'

  return {
    id: generateUUID(),
    type,
    stock_id: stockItem.id,
    item_id: itemId,
    name: stockItem.ingredient?.name || stockItem.product?.name || '',
    expected_quantity: stockItem.quantity,
    actual_quantity: stockItem.quantity,
    unit: stockItem.unit,
    price_per_unit: stockItem.price_per_unit,
  }
}

const createFormItemFromItem = (
  type: 'ingredient' | 'product' | 'tech_card' | 'semi_finished',
  itemId: string,
  name: string,
  quantity: number,
  unit: string,
  pricePerUnit: number
): InventoryFormItem => {
  return {
    id: generateUUID(),
    type,
    stock_id: itemId, // Use itemId as stock_id for non-stock items
    item_id: itemId,
    name,
    expected_quantity: quantity,
    actual_quantity: quantity,
    unit,
    price_per_unit: pricePerUnit,
  }
}

export const useAddInventoryModal = (
  props: AddInventoryModalProps
): UseAddInventoryModalResult => {
  const [formData, setFormData] = useState<AddInventoryFormData>(getDefaultFormData)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [treeSearchQuery, setTreeSearchQuery] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [isDateTimeValid, setIsDateTimeValid] = useState(true)

  const { data: warehouses = [] } = useGetWarehouses()
  const { data: existingInventory } = useGetInventory(props.inventoryId ?? undefined)
  const { data: stockItems = [] } = useGetStock(
    formData.warehouse_id ? { warehouse_id: formData.warehouse_id } : undefined
  )

  // Fetch data for product tree
  const { data: ingredients = [] } = useGetIngredients(
    formData.warehouse_id ? { active: true } : undefined
  )
  const { data: products = [] } = useGetProducts(
    formData.warehouse_id ? { active: true } : undefined
  )
  const { data: ingredientCategories = [] } = useGetIngredientCategories()
  const { data: productCategories = [] } = useGetCategories()
  const { data: techCards = [] } = useGetTechnicalCards()
  const { data: semiFinished = [] } = useGetSemiFinishedProducts()

  const createInventoryMutation = useCreateInventory()
  const updateInventoryMutation = useUpdateInventory()

  const isEditMode = !!props.inventoryId

  // Reset form when modal opens/closes or inventoryId changes
  useEffect(() => {
    if (props.isOpen) {
      if (existingInventory && props.inventoryId) {
        const scheduledDate = existingInventory.scheduled_date
          ? new Date(existingInventory.scheduled_date)
          : null
        const actualDate = existingInventory.actual_date
          ? new Date(existingInventory.actual_date)
          : null
        const date = scheduledDate || actualDate || new Date()

        const items: InventoryFormItem[] = (existingInventory.items || []).map((item) => ({
          id: generateUUID(),
          type: item.type,
          stock_id: item.ingredient_id?.toString() || item.product_id?.toString() || '',
          item_id:
            item.ingredient_id?.toString() ||
            item.product_id?.toString() ||
            item.tech_card_id?.toString() ||
            item.semi_finished_id?.toString() ||
            undefined,
          name:
            item.ingredient_id?.toString() ||
            item.product_id?.toString() ||
            item.tech_card_id?.toString() ||
            item.semi_finished_id?.toString() ||
            '',
          expected_quantity: item.expected_quantity,
          actual_quantity: item.actual_quantity,
          unit: item.unit,
          price_per_unit: item.price_per_unit,
        }))

        setFormData({
          warehouse_id: existingInventory.warehouse_id,
          checkType: scheduledDate ? 'retroactive' : 'at_time',
          date: date.toISOString().split('T')[0],
          time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
          type: existingInventory.type,
          comment: existingInventory.comment || '',
          items,
        })
      } else {
        setFormData(getDefaultFormData())
      }
      setSearchQuery('')
      setTreeSearchQuery('')
      setExpandedNodes(new Set())
    }
    setFieldErrors({})
  }, [props.isOpen, props.inventoryId, existingInventory])

  const filteredStockItems = useMemo(() => {
    if (!searchQuery) return stockItems

    const query = searchQuery.toLowerCase()
    return stockItems.filter(
      (item) =>
        item.ingredient?.name.toLowerCase().includes(query) ||
        item.product?.name.toLowerCase().includes(query)
    )
  }, [stockItems, searchQuery])

  const itemsNotInInventory = useMemo(() => {
    const stockIdsInInventory = new Set(formData.items.map((item) => item.stock_id))
    return filteredStockItems.filter((item) => !stockIdsInInventory.has(item.id))
  }, [filteredStockItems, formData.items])

  // Build product tree for selection
  const productTree = useMemo((): ProductTreeNode[] => {
    // Create a unified key for selected items
    // For ingredients/products: use type + item_id (or stock_id if item_id is not set)
    // For tech_cards/semi_finished: use type + item_id
    const selectedItems = new Set(
      formData.items.map((item) => {
        const keyId = item.item_id || item.stock_id
        return `${item.type}:${keyId}`
      })
    )

    // Helper to filter by search query
    const filterBySearch = <T extends { name: string }>(items: T[]) => {
      if (!treeSearchQuery) return items
      const query = treeSearchQuery.toLowerCase()
      return items.filter((item) => item.name.toLowerCase().includes(query))
    }

    // Ingredients with categories
    const ingredientNodes: ProductTreeNode[] = ingredientCategories.map((cat) => {
      const catIngredients = ingredients.filter((ing) => ing.category_id === cat.id)
      const filteredIngredients = filterBySearch(catIngredients)

      const itemNodes: ProductTreeNode[] = filteredIngredients.map((ing) => {
        const stock = stockItems.find((s) => s.ingredient_id === ing.id)
        // Use ingredient id as the key for consistency
        const key = `ingredient:${ing.id}`
        return {
          id: key,
          name: ing.name,
          type: 'item',
          checked: selectedItems.has(key),
          expanded: false,
          itemType: 'ingredient',
          stockId: stock?.id,
          itemId: ing.id,
        }
      })

      // Calculate checked state based on ALL items in category, not just filtered
      const allCatItemKeys = catIngredients.map((ing) => `ingredient:${ing.id}`)
      const allChecked = allCatItemKeys.length > 0 && allCatItemKeys.every((key) => selectedItems.has(key))

      return {
        id: `ing-cat-${cat.id}`,
        name: cat.name,
        type: 'category',
        count: catIngredients.length,
        checked: allChecked,
        expanded: expandedNodes.has(`ing-cat-${cat.id}`),
        children: itemNodes,
      }
    })

    // Products with categories
    const productNodes: ProductTreeNode[] = productCategories.map((cat) => {
      const catProducts = products.filter((prod) => prod.category_id === cat.id)
      const filteredProducts = filterBySearch(catProducts)

      const itemNodes: ProductTreeNode[] = filteredProducts.map((prod) => {
        const stock = stockItems.find((s) => s.product_id === prod.id)
        // Use product id as the key for consistency
        const key = `product:${prod.id}`
        return {
          id: key,
          name: prod.name,
          type: 'item',
          checked: selectedItems.has(key),
          expanded: false,
          itemType: 'product',
          stockId: stock?.id,
          itemId: prod.id,
        }
      })

      // Calculate checked state based on ALL items in category, not just filtered
      const allCatItemKeys = catProducts.map((prod) => `product:${prod.id}`)
      const allChecked = allCatItemKeys.length > 0 && allCatItemKeys.every((key) => selectedItems.has(key))

      return {
        id: `prod-cat-${cat.id}`,
        name: cat.name,
        type: 'category',
        count: catProducts.length,
        checked: allChecked,
        expanded: expandedNodes.has(`prod-cat-${cat.id}`),
        children: itemNodes,
      }
    })

    // Tech cards
    const filteredTechCards = filterBySearch(techCards)
    const techCardNodes: ProductTreeNode[] = filteredTechCards.map((tc) => {
      const key = `tech_card:${tc.id}`
      return {
        id: key,
        name: tc.name,
        type: 'item',
        checked: selectedItems.has(key),
        expanded: false,
        itemType: 'tech_card',
        itemId: tc.id,
      }
    })

    // Semi-finished
    const filteredSemiFinished = filterBySearch(semiFinished)
    const semiFinishedNodes: ProductTreeNode[] = filteredSemiFinished.map((sf) => {
      const key = `semi_finished:${sf.id}`
      return {
        id: key,
        name: sf.name,
        type: 'item',
        checked: selectedItems.has(key),
        expanded: false,
        itemType: 'semi_finished',
        itemId: sf.id,
      }
    })

    // Root nodes
    const tree: ProductTreeNode[] = []

    // Ingredients root - check ALL ingredients, not just filtered
    if (ingredientNodes.length > 0) {
      const allIngredientKeys = ingredients.map((ing) => `ingredient:${ing.id}`)
      const allIngredientsChecked = allIngredientKeys.length > 0 && allIngredientKeys.every((key) => selectedItems.has(key))
      tree.push({
        id: 'ingredients-root',
        name: 'Ингредиенты',
        type: 'ingredients',
        count: ingredients.length,
        checked: allIngredientsChecked,
        expanded: expandedNodes.has('ingredients-root'),
        children: ingredientNodes,
      })
    }

    // Products root - check ALL products, not just filtered
    if (productNodes.length > 0) {
      const allProductKeys = products.map((prod) => `product:${prod.id}`)
      const allProductsChecked = allProductKeys.length > 0 && allProductKeys.every((key) => selectedItems.has(key))
      tree.push({
        id: 'products-root',
        name: 'Товары',
        type: 'products',
        count: products.length,
        checked: allProductsChecked,
        expanded: expandedNodes.has('products-root'),
        children: productNodes,
      })
    }

    // Tech cards root - check ALL tech cards and semi-finished, not just filtered
    if (techCards.length > 0 || semiFinished.length > 0) {
      const allTechCardKeys = techCards.map((tc) => `tech_card:${tc.id}`)
      const allSemiFinishedKeys = semiFinished.map((sf) => `semi_finished:${sf.id}`)
      const allTechCardKeysChecked = allTechCardKeys.length > 0 && allTechCardKeys.every((key) => selectedItems.has(key))
      const allSemiFinishedChecked = allSemiFinishedKeys.length === 0 || allSemiFinishedKeys.every((key) => selectedItems.has(key))
      const allChecked = allTechCardKeysChecked && allSemiFinishedChecked

      tree.push({
        id: 'tech-cards-root',
        name: 'Произведенные тех. карты и полуфабрикаты',
        type: 'tech_cards',
        count: techCards.length + semiFinished.length,
        checked: allChecked,
        expanded: expandedNodes.has('tech-cards-root'),
        children: [...techCardNodes, ...semiFinishedNodes],
      })
    }

    return tree
  }, [
    ingredients,
    products,
    ingredientCategories,
    productCategories,
    techCards,
    semiFinished,
    stockItems,
    formData.items,
    treeSearchQuery,
    expandedNodes,
  ])

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.warehouse_id) {
      errors.warehouse_id = 'Выберите склад'
    }
    if (!formData.date) {
      errors.date = 'Укажите дату'
    }
    if (!formData.time) {
      errors.time = 'Укажите время'
    }
    if (formData.type === 'partial' && formData.items.length === 0) {
      errors.type = 'Выберите хотя бы один товар'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const isFormValid = useMemo(() => {
    const baseValid =
      formData.warehouse_id !== '' && formData.date !== '' && formData.time !== ''
    if (formData.type === 'partial') {
      return baseValid && formData.items.length > 0
    }
    return baseValid
  }, [formData])

  const handleFieldChange = useCallback(
    (field: keyof AddInventoryFormData, value: string | InventoryFormItem[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (fieldErrors[field as string]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field as string]
          return newErrors
        })
      }
    },
    [fieldErrors]
  )

  const handleCheckTypeChange = useCallback((type: 'retroactive' | 'at_time') => {
    setFormData((prev) => ({ ...prev, checkType: type }))
  }, [])

  const handleTypeChange = useCallback((type: 'full' | 'partial') => {
    setFormData((prev) => ({ ...prev, type, items: type === 'full' ? [] : prev.items }))
  }, [])

  const handleAddItem = useCallback(
    (stockItem: Stock) => {
      const formItem = stockItemToFormItem(stockItem)
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, formItem],
      }))
    },
    []
  )

  const handleRemoveItem = useCallback((itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }, [])

  const handleItemQuantityChange = useCallback((itemId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, actual_quantity: quantity } : item
      ),
    }))
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleTreeSearchChange = useCallback((query: string) => {
    setTreeSearchQuery(query)
  }, [])

  const handleTreeNodeToggle = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }, [])

  const handleTreeNodeCheck = useCallback(
    (nodeId: string, checked: boolean) => {
      // Find the node in the tree
      const findNode = (nodes: ProductTreeNode[]): ProductTreeNode | null => {
        for (const node of nodes) {
          if (node.id === nodeId) return node
          if (node.children) {
            const found = findNode(node.children)
            if (found) return found
          }
        }
        return null
      }

      const node = findNode(productTree)
      if (!node) return

      // Helper to get the unique key for a form item (matching selectedItems logic)
      const getFormItemKey = (item: InventoryFormItem): string => {
        const keyId = item.item_id || item.stock_id
        return `${item.type}:${keyId}`
      }

      if (node.type === 'item') {
        // Handle individual item check
        if (checked) {
          // Add item to form
          const itemType = node.itemType
          if (!itemType) return

          // For ingredients and products with stock
          if (node.stockId && (itemType === 'ingredient' || itemType === 'product')) {
            const stock = stockItems.find((s) => s.id === node.stockId)
            if (stock) {
              const formItem = stockItemToFormItem(stock, itemType, node.itemId)
              setFormData((prev) => ({
                ...prev,
                items: [...prev.items, formItem],
              }))
            }
          } else if (node.itemId) {
            // For tech_cards and semi_finished (items without stock)
            // Create a form item with default values
            const formItem = createFormItemFromItem(
              itemType,
              node.itemId,
              node.name,
              0,
              'шт',
              0
            )
            setFormData((prev) => ({
              ...prev,
              items: [...prev.items, formItem],
            }))
          }
        } else {
          // Remove item from form using the matching key
          const keyToRemove = `${node.itemType}:${node.itemId}`
          setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((item) => getFormItemKey(item) !== keyToRemove),
          }))
        }
      } else {
        // Handle category check - check/uncheck all children
        const collectItems = (
          n: ProductTreeNode
        ): Array<{
          itemType?: 'ingredient' | 'product' | 'tech_card' | 'semi_finished'
          itemId?: string
          stockId?: string
          name: string
        }> => {
          if (n.type === 'item') {
            return [
              {
                itemType: n.itemType,
                itemId: n.itemId,
                stockId: n.stockId,
                name: n.name,
              },
            ]
          }
          if (n.children) {
            return n.children.flatMap(collectItems)
          }
          return []
        }

        const itemsToToggle = collectItems(node)

        setFormData((prev) => {
          let newItems = [...prev.items]

          if (checked) {
            // Add all items
            itemsToToggle.forEach(({ itemType, itemId, stockId, name }) => {
              if (!itemType || !itemId) return

              // Check if item is already in the list
              const key = `${itemType}:${itemId}`
              const alreadyExists = newItems.some((item) => getFormItemKey(item) === key)
              if (alreadyExists) return

              // For ingredients and products with stock
              if (stockId && (itemType === 'ingredient' || itemType === 'product')) {
                const stock = stockItems.find((s) => s.id === stockId)
                if (stock) {
                  newItems.push(stockItemToFormItem(stock, itemType, itemId))
                }
              } else {
                // For tech_cards and semi_finished
                newItems.push(createFormItemFromItem(itemType, itemId, name, 0, 'шт', 0))
              }
            })
          } else {
            // Remove all matching items
            const keysToRemove = new Set(
              itemsToToggle
                .filter(
                  ({ itemType, itemId }) =>
                    itemType !== undefined && itemId !== undefined
                )
                .map(
                  ({ itemType, itemId }) =>
                    `${itemType as 'ingredient' | 'product' | 'tech_card' | 'semi_finished'}:${itemId as string}`
                )
            )
            newItems = newItems.filter((item) => !keysToRemove.has(getFormItemKey(item)))
          }

          return { ...prev, items: newItems }
        })
      }
    },
    [productTree, stockItems]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      try {
        const [hours, minutes] = formData.time.split(':')
        const dateTime = new Date(formData.date)
        dateTime.setHours(parseInt(hours, 10))
        dateTime.setMinutes(parseInt(minutes, 10))

        const scheduledDate =
          formData.checkType === 'retroactive' ? dateTime.toISOString() : undefined

        const items =
          formData.type === 'partial'
            ? formData.items.map((item) => ({
                type: item.type,
                ingredient_id: item.type === 'ingredient' ? item.item_id : undefined,
                product_id: item.type === 'product' ? item.item_id : undefined,
                tech_card_id: item.type === 'tech_card' ? item.item_id : undefined,
                semi_finished_id: item.type === 'semi_finished' ? item.item_id : undefined,
                actual_quantity: item.actual_quantity,
              }))
            : undefined

        const requestData = {
          warehouse_id: formData.warehouse_id,
          type: formData.type,
          scheduled_date: scheduledDate,
          comment: formData.comment || undefined,
          items,
        }

        let inventoryId: string | undefined

        if (isEditMode && props.inventoryId) {
          const updatedInventory: Inventory = await updateInventoryMutation.mutateAsync({
            id: props.inventoryId,
            data: requestData,
          })
          inventoryId = updatedInventory.id
        } else {
          const createdInventory: Inventory =
            await createInventoryMutation.mutateAsync(requestData)
          inventoryId = createdInventory.id
        }

        if (inventoryId) {
          props.onSuccess(inventoryId)
        }
      } catch (error) {
        console.error('Failed to save inventory:', error)
      }
    },
    [formData, validateForm, createInventoryMutation, updateInventoryMutation, props, isEditMode]
  )

  const handleClose = useCallback(() => {
    setFormData(getDefaultFormData())
    setSearchQuery('')
    setTreeSearchQuery('')
    setExpandedNodes(new Set())
    setFieldErrors({})
    props.onClose()
  }, [props])

  const error =
    (createInventoryMutation.error as Error | null) ??
    (updateInventoryMutation.error as Error | null)
  const errorMessage = error?.message || null

  return {
    formData,
    isSubmitting: createInventoryMutation.isPending || updateInventoryMutation.isPending,
    error: errorMessage,
    fieldErrors,
    isFormValid,
    isDateTimeValid,
    isEditMode,
    stockItems,
    filteredStockItems: itemsNotInInventory,
    searchQuery,
    productTree,
    treeSearchQuery,
    warehouses: warehouses.map((w) => ({ id: w.id, name: w.name })),
    handleFieldChange,
    handleCheckTypeChange,
    handleTypeChange,
    handleAddItem,
    handleRemoveItem,
    handleItemQuantityChange,
    handleSearchChange,
    handleTreeSearchChange,
    handleTreeNodeToggle,
    handleTreeNodeCheck,
    handleSubmit,
    handleClose,
  }
}
