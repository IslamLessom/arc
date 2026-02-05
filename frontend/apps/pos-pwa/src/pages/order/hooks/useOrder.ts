import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useGetCategories, useGetProducts } from '@restaurant-pos/api-client'
import { useCurrentUser } from '@restaurant-pos/api-client'
import { apiClient } from '@restaurant-pos/api-client'
import type { UseOrderResult, OrderData, GuestOrder, OrderItem, ProductCategory } from '../model/types'
import { OrderTab } from '../model/enums'
import type { Product } from '@restaurant-pos/api-client'

const ORDER_STORAGE_KEY = 'order_data_'

export function useOrder(): UseOrderResult {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = useParams<{ orderId: string }>()
  const { data: currentUser } = useCurrentUser()
  const establishmentId = currentUser?.establishment_id || ''

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<OrderTab>(OrderTab.Check)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories({
    type: 'product',
  })

  // Fetch products for selected category
  const { data: products = [], isLoading: isLoadingProducts } = useGetProducts(
    selectedCategoryId ? { category_id: selectedCategoryId, active: true } : { active: true }
  )

  const locationState = location.state as { guestsCount?: number; tableNumber?: number } | null

  // Initialize order data from localStorage or create new
  useMemo(() => {
    if (orderId && !orderData) {
      const stored = localStorage.getItem(`${ORDER_STORAGE_KEY}${orderId}`)
      if (stored) {
        setOrderData(JSON.parse(stored))
      } else {
        const guestsCountFromState = Math.max(1, Number(locationState?.guestsCount || 1))
        const tableNumberFromState = locationState?.tableNumber

        const guests: GuestOrder[] = Array.from({ length: guestsCountFromState }, (_, index) => ({
          guestNumber: index + 1,
          items: [],
          totalAmount: 0,
        }))

        // Create initial order data
        const initialData: OrderData = {
          orderId,
          tableNumber: tableNumberFromState,
          guestsCount: guestsCountFromState,
          guests,
          selectedGuestNumber: 1,
          totalAmount: 0,
        }
        setOrderData(initialData)
        localStorage.setItem(`${ORDER_STORAGE_KEY}${orderId}`, JSON.stringify(initialData))
      }
    }
  }, [orderId, orderData, locationState])

  // Save order data to localStorage whenever it changes
  useMemo(() => {
    if (orderData && orderId) {
      localStorage.setItem(`${ORDER_STORAGE_KEY}${orderId}`, JSON.stringify(orderData))
    }
  }, [orderData, orderId])

  // Get selected guest
  const selectedGuest = useMemo(() => {
    if (!orderData) return null
    return orderData.guests.find(g => g.guestNumber === orderData.selectedGuestNumber) || null
  }, [orderData])

  // Get products for selected category
  const selectedCategoryProducts = useMemo(() => {
    if (!selectedCategoryId) return products
    return products.filter(p => p.category_id === selectedCategoryId)
  }, [products, selectedCategoryId])

  // Navigate back
  const handleBack = useCallback(() => {
    navigate('/table-selection')
  }, [navigate])

  // Select category
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId)
  }, [])

  // Add product to selected guest
  const handleProductClick = useCallback((product: Product) => {
    if (!orderData) return

    const guestIndex = orderData.guests.findIndex(g => g.guestNumber === orderData.selectedGuestNumber)
    if (guestIndex === -1) return

    const guest = orderData.guests[guestIndex]
    const existingItemIndex = guest.items.findIndex(item => item.productId === product.id)

    let newItems: OrderItem[]
    if (existingItemIndex >= 0) {
      // Update quantity
      newItems = guest.items.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + 1
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * item.price,
          }
        }
        return item
      })
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: `${product.id}_${Date.now()}`,
        productId: product.id,
        product,
        quantity: 1,
        price: product.price,
        totalPrice: product.price,
      }
      newItems = [...guest.items, newItem]
    }

    const newGuestTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const newGuests = [...orderData.guests]
    newGuests[guestIndex] = {
      ...guest,
      items: newItems,
      totalAmount: newGuestTotal,
    }

    const newTotalAmount = newGuests.reduce((sum, g) => sum + g.totalAmount, 0)

    setOrderData({
      ...orderData,
      guests: newGuests,
      totalAmount: newTotalAmount,
    })
  }, [orderData])

  // Select guest
  const handleGuestSelect = useCallback((guestNumber: number) => {
    if (!orderData) return
    setOrderData({
      ...orderData,
      selectedGuestNumber: guestNumber,
    })
  }, [orderData])

  // Add new guest
  const handleAddGuest = useCallback(() => {
    if (!orderData) return

    const newGuestNumber = orderData.guests.length + 1
    const newGuest: GuestOrder = {
      guestNumber: newGuestNumber,
      items: [],
      totalAmount: 0,
    }

    setOrderData({
      ...orderData,
      guestsCount: newGuestNumber,
      guests: [...orderData.guests, newGuest],
      selectedGuestNumber: newGuestNumber,
    })
  }, [orderData])

  // Change item quantity
  const handleQuantityChange = useCallback((itemId: string, delta: number) => {
    if (!orderData) return

    const guestIndex = orderData.guests.findIndex(g => g.guestNumber === orderData.selectedGuestNumber)
    if (guestIndex === -1) return

    const guest = orderData.guests[guestIndex]
    const itemIndex = guest.items.findIndex(item => item.id === itemId)
    if (itemIndex === -1) return

    const item = guest.items[itemIndex]
    const newQuantity = item.quantity + delta

    if (newQuantity <= 0) {
      // Remove item
      const newItems = guest.items.filter(i => i.id !== itemId)
      const newGuestTotal = newItems.reduce((sum, i) => sum + i.totalPrice, 0)
      const newGuests = [...orderData.guests]
      newGuests[guestIndex] = {
        ...guest,
        items: newItems,
        totalAmount: newGuestTotal,
      }
      const newTotalAmount = newGuests.reduce((sum, g) => sum + g.totalAmount, 0)
      setOrderData({
        ...orderData,
        guests: newGuests,
        totalAmount: newTotalAmount,
      })
    } else {
      // Update quantity
      const newItems = guest.items.map((i, idx) => {
        if (idx === itemIndex) {
          return {
            ...i,
            quantity: newQuantity,
            totalPrice: newQuantity * i.price,
          }
        }
        return i
      })
      const newGuestTotal = newItems.reduce((sum, i) => sum + i.totalPrice, 0)
      const newGuests = [...orderData.guests]
      newGuests[guestIndex] = {
        ...guest,
        items: newItems,
        totalAmount: newGuestTotal,
      }
      const newTotalAmount = newGuests.reduce((sum, g) => sum + g.totalAmount, 0)
      setOrderData({
        ...orderData,
        guests: newGuests,
        totalAmount: newTotalAmount,
      })
    }
  }, [orderData])

  // Remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    handleQuantityChange(itemId, -Infinity)
  }, [handleQuantityChange])

  // Change tab
  const handleTabChange = useCallback((tab: OrderTab) => {
    setSelectedTab(tab)
  }, [])

  // Submit order
  const handleSubmitOrder = useCallback(() => {
    console.log('Submitting order:', orderData)
    // TODO: Implement order submission
  }, [orderData])

  // Process payment
  const handlePayment = useCallback(async () => {
    if (!orderData || orderData.totalAmount <= 0 || isProcessingPayment) return

    const itemsToSend = orderData.guests.flatMap(guest =>
      guest.items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        guest_number: guest.guestNumber,
      }))
    )

    if (itemsToSend.length === 0) return

    setIsProcessingPayment(true)

    try {
      const isUuid = (value?: string) =>
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

      let serverOrderId = orderId

      if (!isUuid(orderId)) {
        const orderResponse = await apiClient.post('/orders', {
          items: itemsToSend,
        })

        serverOrderId = orderResponse?.data?.id
      }

      if (!serverOrderId) {
        throw new Error('Не удалось создать заказ на сервере')
      }

      await apiClient.post(`/orders/${serverOrderId}/pay`, {
        cash_amount: orderData.totalAmount,
        card_amount: 0,
        client_cash: orderData.totalAmount,
      })
    } catch (error) {
      console.error('Failed to process payment:', error)
    } finally {
      setIsProcessingPayment(false)
    }
  }, [orderData, orderId, isProcessingPayment])

  return {
    // Data
    orderData,
    categories,
    products,
    selectedCategoryId,
    selectedTab,

    // Loading states
    isLoading: isLoadingCategories || isLoadingProducts,
    isLoadingCategories,
    isLoadingProducts,
    isCreatingOrder: false,
    error: null,

    // Actions
    handleBack,
    handleCategorySelect,
    handleProductClick,
    handleGuestSelect,
    handleAddGuest,
    handleQuantityChange,
    handleRemoveItem,
    handleTabChange,
    handleSubmitOrder,
    handlePayment,

    // Computed
    selectedGuest,
    selectedCategoryProducts,
  }
}
