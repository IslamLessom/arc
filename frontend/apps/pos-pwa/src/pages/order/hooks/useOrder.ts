import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useGetCategories, useGetProducts, useGetTechnicalCards, useOrder as useApiOrder } from '@restaurant-pos/api-client'
import { useCurrentUser } from '@restaurant-pos/api-client'
import { apiClient } from '@restaurant-pos/api-client'
import { useMarketingPromotions } from '@restaurant-pos/api-client'
import type {
  UseOrderResult,
  OrderData,
  GuestOrder,
  OrderItem,
  ProductCategory,
  MenuItem,
  PromotionPreviewResponse,
  PromotionPreviewItem,
} from '../model/types'
import { OrderTab, DiscountType } from '../model/enums'
import type { Product } from '@restaurant-pos/api-client'
import type { TechnicalCard } from '@restaurant-pos/api-client'
import type { Customer } from '@restaurant-pos/api-client'
import { useExclusions } from './useExclusions'

const ORDER_STORAGE_KEY = 'order_data_'

function recalculateTotals(guests: GuestOrder[]) {
  const totalAmount = guests.reduce((sum, g) => sum + g.totalAmount, 0)
  const totalDiscount = guests.reduce((sum, g) => sum + (g.discount?.amount || 0), 0)
  const finalAmount = totalAmount - totalDiscount
  return { totalAmount, totalDiscount, finalAmount }
}

function normalizeOrderData(data: OrderData): OrderData {
  const normalizedGuests = data.guests.map((guest) => ({
    ...guest,
    customer: guest.customer,
    discount: guest.discount || {
      type: DiscountType.None,
      value: 0,
      amount: 0,
    },
  }))

  const selectedGuestNumber = data.selectedGuestNumber || 1
  const selectedGuest = normalizedGuests.find((g) => g.guestNumber === selectedGuestNumber)
  const selectedCustomer = selectedGuest?.customer
  const { totalAmount, totalDiscount, finalAmount } = recalculateTotals(normalizedGuests)

  return {
    ...data,
    guests: normalizedGuests,
    selectedGuestNumber,
    selectedCustomer,
    totalAmount,
    totalDiscount,
    finalAmount,
  }
}

export function useOrder(): UseOrderResult {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = useParams<{ orderId: string }>()
  useCurrentUser()
  const queryClient = useQueryClient()

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<OrderTab>(OrderTab.Check)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isPromotionsModalOpen, setIsPromotionsModalOpen] = useState(false)
  const [promotionPreview, setPromotionPreview] = useState<PromotionPreviewResponse | null>(null)

  // Fetch categories all types (product, tech_card, semi_finished)
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories({
    // type не указываем - получаем все типы категорий
  })

  // Получаем выбранную категорию для определения её типа
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null
    return categories.find(c => c.id === selectedCategoryId) || null
  }, [categories, selectedCategoryId])

  // Fetch products:
  // - Если категория не выбрана - загружаем все активные товары
  // - Если категория типа product - загружаем товары из этой категории
  const { data: products = [], isLoading: isLoadingProducts } = useGetProducts(
    !selectedCategoryId
      ? { active: true }
      : selectedCategory?.type === 'product'
        ? { category_id: selectedCategoryId, active: true }
        : undefined
  )

  // Fetch technical cards:
  // - Если категория не выбрана - загружаем все активные тех-карты
  // - Если категория типа tech_card - загружаем тех-карты из этой категории
  const { data: technicalCards = [], isLoading: isLoadingTechnicalCards } = useGetTechnicalCards(
    !selectedCategoryId
      ? { active: true }
      : selectedCategory?.type === 'tech_card'
        ? { category_id: selectedCategoryId, active: true }
        : undefined
  )

  // Загружаем исключения из скидок
  const { calculateDiscountWithExclusions, checkAllItemsExcluded } = useExclusions()
  const { promotions } = useMarketingPromotions()

  const activePromotions = useMemo(() => {
    if (promotionPreview?.active_promotions?.length) {
      return promotionPreview.active_promotions
    }

    const now = new Date()
    return promotions.filter((promotion) => {
      if (!promotion.active) return false
      const start = new Date(promotion.start_date)
      const end = new Date(promotion.end_date)
      return now >= start && now <= end
    })
  }, [promotions, promotionPreview])

  const hasActivePromotions = activePromotions.length > 0

  const findPreviewByMenuItem = useCallback((item: MenuItem): PromotionPreviewItem | null => {
    if (!promotionPreview?.items?.length) return null
    const isTechCard = 'itemType' in item && item.itemType === 'tech_card'
    return promotionPreview.items.find((previewItem) => {
      if (isTechCard) {
        return previewItem.tech_card_id === item.id
      }
      return previewItem.product_id === item.id
    }) || null
  }, [promotionPreview])

  const getItemPromotionBadge = useCallback((item: MenuItem): string | null => {
    const preview = findPreviewByMenuItem(item)
    if (preview) {
      if (!preview.eligible) {
        return null
      }
      return preview.promotion_badge || (preview.promotion_names?.[0] ? 'Акция' : null)
    }

    if (item.exclude_from_discounts) {
      return null
    }
    return activePromotions.length > 0 ? 'Акция' : null
  }, [activePromotions.length, findPreviewByMenuItem])

  const getItemIneligibilityReason = useCallback((item: MenuItem): string | null => {
    const preview = findPreviewByMenuItem(item)
    if (preview?.ineligibility_reason) {
      return preview.ineligibility_reason
    }
    if (item.exclude_from_discounts) {
      return 'Товар исключен из скидок'
    }
    return null
  }, [findPreviewByMenuItem])

  const locationState = location.state as { guestsCount?: number; tableNumber?: number; tableId?: string } | null

  // Проверяем, является ли orderId UUID (заказ с сервера)
  const isUuidOrderId = useMemo(() => {
    if (!orderId) return false
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)
  }, [orderId])

  // Загружаем заказ с сервера если это UUID
  const { data: serverOrder } = useApiOrder(orderId || '')

  // Преобразуем заказ с сервера в формат OrderData
  const convertServerOrderToOrderData = useCallback((serverOrderData: any): OrderData => {
    // Группируем items по guest_number
    const guestsMap = new Map<number, OrderItem[]>()

    serverOrderData.items?.forEach((item: any) => {
      const guestNumber = item.guest_number || 1

      if (!guestsMap.has(guestNumber)) {
        guestsMap.set(guestNumber, [])
      }

      guestsMap.get(guestNumber)?.push({
        id: item.id,
        productId: item.product_id,
        techCardId: item.tech_card_id,
        itemType: item.product_id ? 'product' : 'tech_card',
        product: item.product,
        techCard: item.tech_card,
        quantity: item.quantity,
        price: item.price || item.product?.price || item.tech_card?.price || 0,
        totalPrice: (item.price || item.product?.price || item.tech_card?.price || 0) * item.quantity,
      })
    })

    // Определяем количество гостей
    const maxGuestNumber = serverOrderData.items?.length > 0
      ? Math.max(...serverOrderData.items.map((i: any) => i.guest_number || 1))
      : serverOrderData.guests_count || 1

    // Создаём гостей с пустыми скидками
    const guests: GuestOrder[] = Array.from({ length: maxGuestNumber }, (_, index) => {
      const guestNumber = index + 1
      const guestItems = guestsMap.get(guestNumber) || []
      const totalAmount = guestItems.reduce((sum, item) => sum + item.totalPrice, 0)

      return {
        guestNumber,
        customer: undefined,
        items: guestItems,
        totalAmount,
        discount: {
          type: DiscountType.None,
          value: 0,
          amount: 0,
        },
        finalAmount: totalAmount,
      }
    })

    const totalAmount = guests.reduce((sum, g) => sum + g.totalAmount, 0)
    const totalDiscount = guests.reduce((sum, g) => sum + (g.discount?.amount || 0), 0)
    const finalAmount = totalAmount - totalDiscount

    return {
      orderId: serverOrderData.id,
      tableNumber: serverOrderData.table_number,
      tableId: serverOrderData.table_id,
      guestsCount: maxGuestNumber,
      guests,
      selectedGuestNumber: 1,
      totalAmount,
      totalDiscount,
      finalAmount,
    }
  }, [])

  // Initialize order data from localStorage, server or create new
  // При первом заходе проверяем localStorage
  useEffect(() => {
    if (orderId && !orderData) {
      const stored = localStorage.getItem(`${ORDER_STORAGE_KEY}${orderId}`)
      console.log('[useOrder] Loading from localStorage:', {
        orderId,
        hasStored: !!stored,
        storageKey: `${ORDER_STORAGE_KEY}${orderId}`
      })
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as OrderData
          console.log('[useOrder] Parsed order data:', parsed)
          setOrderData(normalizeOrderData(parsed))
        } catch (e) {
          console.error('Failed to parse stored order data:', e)
        }
      }
    }
  }, [orderId, orderData])

  // Загружаем данные с сервера когда они приходят
  useEffect(() => {
    if (orderId && !orderData && isUuidOrderId && serverOrder) {
      // Это UUID, localStorage пустой и заказ загружен с сервера
      const orderDataFromServer = convertServerOrderToOrderData(serverOrder)
      setOrderData(orderDataFromServer)
      localStorage.setItem(`${ORDER_STORAGE_KEY}${orderId}`, JSON.stringify(orderDataFromServer))
    }
  }, [orderId, orderData, isUuidOrderId, serverOrder, convertServerOrderToOrderData])

  // Создаём новый заказ если нет данных вообще
  useEffect(() => {
    if (orderId && !orderData && !isUuidOrderId && !serverOrder) {
      // Проверяем есть ли данные в localStorage перед созданием нового заказа
      const stored = localStorage.getItem(`${ORDER_STORAGE_KEY}${orderId}`)
      console.log('[useOrder] Creating new order check:', {
        orderId,
        hasOrderData: !!orderData,
        isUuidOrderId,
        hasServerOrder: !!serverOrder,
        hasStored: !!stored
      })
      if (stored) {
        // Данные уже есть в localStorage, не создаем новый заказ
        // useEffect выше загрузит их
        console.log('[useOrder] Found stored data, skipping new order creation')
        return
      }
      
      console.log('[useOrder] Creating new empty order')
      // Новый заказ (не UUID) - создаём пустой
      const guestsCountFromState = Math.max(1, Number(locationState?.guestsCount || 1))
      const tableNumberFromState = locationState?.tableNumber
      const tableIdFromState = locationState?.tableId

      const guests: GuestOrder[] = Array.from({ length: guestsCountFromState }, (_, index) => ({
        guestNumber: index + 1,
        customer: undefined,
        items: [],
        totalAmount: 0,
        discount: {
          type: DiscountType.None,
          value: 0,
          amount: 0,
        },
        finalAmount: 0,
      }))

      // Create initial order data
      const initialData: OrderData = {
        orderId,
        tableNumber: tableNumberFromState,
        tableId: tableIdFromState,
        guestsCount: guestsCountFromState,
        guests,
        selectedGuestNumber: 1,
        totalAmount: 0,
        totalDiscount: 0,
        finalAmount: 0,
      }
      setOrderData(initialData)
      localStorage.setItem(`${ORDER_STORAGE_KEY}${orderId}`, JSON.stringify(initialData))
    }
  }, [orderId, orderData, isUuidOrderId, serverOrder, locationState])

  // Save order data to localStorage whenever it changes
  useEffect(() => {
    if (orderData && orderId) {
      console.log('[useOrder] Saving to localStorage:', {
        orderId,
        storageKey: `${ORDER_STORAGE_KEY}${orderId}`,
        totalAmount: orderData.totalAmount,
        itemsCount: orderData.guests.reduce((sum, g) => sum + g.items.length, 0)
      })
      localStorage.setItem(`${ORDER_STORAGE_KEY}${orderId}`, JSON.stringify(orderData))
    }
  }, [orderData, orderId])

  // Get selected guest
  const selectedGuest = useMemo(() => {
    if (!orderData) return null
    return orderData.guests.find(g => g.guestNumber === orderData.selectedGuestNumber) || null
  }, [orderData])

  // Get products for selected category (для обратной совместимости)
  const selectedCategoryProducts = useMemo(() => {
    if (!selectedCategoryId) return products
    return products.filter(p => p.category_id === selectedCategoryId)
  }, [products, selectedCategoryId])

  // Объединенный список товаров и тех-карт для выбранной категории
  const selectedCategoryItems = useMemo(() => {
    if (!selectedCategoryId) return []

    const productItems = products
      .filter(p => p.category_id === selectedCategoryId)
      .map(p => ({ ...p, itemType: 'product' as const }))

    const techCardItems = technicalCards
      .filter(tc => tc.category_id === selectedCategoryId)
      .map(tc => ({ ...tc, itemType: 'tech_card' as const }))

    return [...productItems, ...techCardItems] as MenuItem[]
  }, [products, technicalCards, selectedCategoryId])

  useEffect(() => {
    const previewItems = selectedCategoryItems.slice(0, 100).map((item) => {
      const isTechCard = 'itemType' in item && item.itemType === 'tech_card'
      return isTechCard
        ? { tech_card_id: item.id, quantity: 1 }
        : { product_id: item.id, quantity: 1 }
    })

    if (previewItems.length === 0) {
      setPromotionPreview(null)
      return
    }

    let isCancelled = false
    apiClient
      .post<{ data: PromotionPreviewResponse }>('/orders/promotions/preview', {
        items: previewItems,
      })
      .then((response) => {
        if (!isCancelled) {
          setPromotionPreview(response.data.data)
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          console.warn('Promotion preview failed:', error)
          setPromotionPreview(null)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [selectedCategoryItems])

  const openPromotionsModal = useCallback(() => {
    setIsPromotionsModalOpen(true)
  }, [])

  const closePromotionsModal = useCallback(() => {
    setIsPromotionsModalOpen(false)
  }, [])

  // Navigate back - сохраняет черновик заказа если есть товары
  const handleBack = useCallback(async () => {
    // Если заказа нет или он пустой - просто выходим
    if (!orderData || orderData.totalAmount === 0) {
      if (orderId) {
        localStorage.removeItem(`${ORDER_STORAGE_KEY}${orderId}`)
      }
      // Обновляем список заказов при выходе
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate('/table-selection')
      return
    }

    // Проверяем, есть ли товары в заказе
    const hasItems = orderData.guests.some(g => g.items.length > 0)
    if (!hasItems) {
      if (orderId) {
        localStorage.removeItem(`${ORDER_STORAGE_KEY}${orderId}`)
      }
      // Обновляем список заказов при выходе
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate('/table-selection')
      return
    }

    // Если есть товары - сохраняем черновик на сервере
    try {
      const isUuid = (value: string) =>
        typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

      const itemsToSend = orderData.guests.flatMap(guest =>
        guest.items.map(item => {
          const result: any = {
            quantity: item.quantity,
            guest_number: guest.guestNumber,
          }
          if (item.itemType === 'product' && item.productId) {
            result.product_id = item.productId
          } else if (item.itemType === 'tech_card' && item.techCardId) {
            result.tech_card_id = item.techCardId
          }
          // Добавляем client_id для каждой позиции если у гостя указан клиент
          if (guest.customer?.id) {
            result.client_id = guest.customer.id
          }
          return result
        })
      ).filter((item: any) => item.product_id || item.tech_card_id) // Убираем пустые items

      if (isUuidOrderId) {
        // Заказ уже существует на сервере - просто выходим, данные сохранены
      } else if (itemsToSend.length > 0) {
        // Для черновика не передаем total_amount: сервер сам посчитает итог,
        // это исключает конфликт total/final после акций и скидок.
        const payload: any = {
          items: itemsToSend,
          guests_count: orderData.guestsCount,
          table_number: orderData.tableNumber,
          table_id: orderData.tableId,
        }
        // Передаем client_id если выбран клиент для начисления баллов и статистики
        if (orderData.selectedCustomer?.id) {
          payload.client_id = orderData.selectedCustomer.id
          console.log('[Draft Order] Sending client_id:', orderData.selectedCustomer.id, 'Customer:', orderData.selectedCustomer.name)
        } else {
          console.log('[Draft Order] No customer selected, client_id will be NULL')
        }
        console.log('[Draft Order] Payload:', JSON.stringify(payload, null, 2))
        const orderResponse = await apiClient.post('/orders', payload)
        const serverOrderId = orderResponse?.data?.id

        if (serverOrderId) {
          // Обновляем localStorage с новым UUID и удаляем старый ключ
          localStorage.removeItem(`${ORDER_STORAGE_KEY}${orderId}`)
          const updatedOrderData = { ...orderData, orderId: serverOrderId }
          localStorage.setItem(`${ORDER_STORAGE_KEY}${serverOrderId}`, JSON.stringify(updatedOrderData))
        }
      }
    } catch (error) {
      console.error('Failed to save draft order:', error)
    }

    // Обновляем список заказов после создания черновика
    queryClient.invalidateQueries({ queryKey: ['orders', 'active'] })
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    navigate('/table-selection')
  }, [orderData, orderId, navigate, isUuidOrderId, queryClient])

  // Select category
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId)
  }, [])

  // Добавление товара или тех-карты в заказ
  const handleAddItem = useCallback((item: MenuItem, itemType: 'product' | 'tech_card') => {
    if (!orderData) return

    const guestIndex = orderData.guests.findIndex(g => g.guestNumber === orderData.selectedGuestNumber)
    if (guestIndex === -1) return

    const guest = orderData.guests[guestIndex]

    // Ищем существующий item по productId или techCardId
    const existingItemIndex = guest.items.findIndex(existingItem => {
      if (itemType === 'product') {
        return existingItem.productId === item.id && existingItem.itemType === 'product'
      } else {
        return existingItem.techCardId === item.id && existingItem.itemType === 'tech_card'
      }
    })

    let newItems: OrderItem[]
    if (existingItemIndex >= 0) {
      // Update quantity
      newItems = guest.items.map((orderItem, index) => {
        if (index === existingItemIndex) {
          const newQuantity = orderItem.quantity + 1
          return {
            ...orderItem,
            quantity: newQuantity,
            totalPrice: newQuantity * orderItem.price,
          }
        }
        return orderItem
      })
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: `${itemType}_${item.id}_${Date.now()}`,
        productId: itemType === 'product' ? item.id : '',
        techCardId: itemType === 'tech_card' ? item.id : undefined,
        itemType,
        product: itemType === 'product' ? item : undefined,
        techCard: itemType === 'tech_card' ? item : undefined,
        quantity: 1,
        price: item.price,
        totalPrice: item.price,
      }
      newItems = [...guest.items, newItem]
    }

    const newGuestTotal = newItems.reduce((sum, orderItem) => sum + orderItem.totalPrice, 0)

    // Пересчитываем скидку для гостя с учётом исключений
    let discountAmount = 0
    if (guest.discount?.type && guest.discount.value > 0) {
      const discountType = guest.discount.type === DiscountType.Percentage ? 'percentage' : 'fixed'
      const result = calculateDiscountWithExclusions(newItems.map(i => ({...i})), discountType, guest.discount.value)
      discountAmount = result.discountAmount
    }

    const newGuest: GuestOrder = {
      ...guest,
      items: newItems,
      totalAmount: newGuestTotal,
      discount: { ...guest.discount, amount: discountAmount },
      finalAmount: newGuestTotal - discountAmount,
    }

    const newGuests = [...orderData.guests]
    newGuests[guestIndex] = newGuest

    const { totalAmount: newTotalAmount, totalDiscount: newTotalDiscount, finalAmount: newFinalAmount } = recalculateTotals(newGuests)

    setOrderData({
      ...orderData,
      guests: newGuests,
      totalAmount: newTotalAmount,
      totalDiscount: newTotalDiscount,
      finalAmount: newFinalAmount,
    })
  }, [orderData])

  // Add product to selected guest (для обратной совместимости)
  const handleProductClick = useCallback((product: Product) => {
    handleAddItem(product as MenuItem, 'product')
  }, [handleAddItem])

  // Add tech card to selected guest
  const handleTechCardClick = useCallback((techCard: TechnicalCard) => {
    handleAddItem(techCard as MenuItem, 'tech_card')
  }, [handleAddItem])

  // Select guest
  const handleGuestSelect = useCallback((guestNumber: number) => {
    if (!orderData) return
    setOrderData({
      ...orderData,
      selectedGuestNumber: guestNumber,
      selectedCustomer: orderData.guests.find(g => g.guestNumber === guestNumber)?.customer,
    })
  }, [orderData])

  // Add new guest
  const handleAddGuest = useCallback(() => {
    if (!orderData) return

    const newGuestNumber = orderData.guests.length + 1
    const newGuest: GuestOrder = {
      guestNumber: newGuestNumber,
      customer: undefined,
      items: [],
      totalAmount: 0,
      discount: {
        type: DiscountType.None,
        value: 0,
        amount: 0,
      },
      finalAmount: 0,
    }

    setOrderData({
      ...orderData,
      guestsCount: newGuestNumber,
      guests: [...orderData.guests, newGuest],
      selectedGuestNumber: newGuestNumber,
      selectedCustomer: undefined,
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

      // Пересчитываем скидку с учётом исключений
      let discountAmount = 0
      if (guest.discount?.type && guest.discount.value > 0) {
        const discountType = guest.discount.type === DiscountType.Percentage ? 'percentage' : 'fixed'
        const result = calculateDiscountWithExclusions(newItems.map(i => ({...i})), discountType, guest.discount.value)
        discountAmount = result.discountAmount
      }

      const newGuest: GuestOrder = {
        ...guest,
        items: newItems,
        totalAmount: newGuestTotal,
        discount: guest.discount ? { ...guest.discount, amount: discountAmount } : { type: DiscountType.None, value: 0, amount: 0 },
        finalAmount: newGuestTotal - discountAmount,
      }

      const newGuests = [...orderData.guests]
      newGuests[guestIndex] = newGuest
      const { totalAmount: newTotalAmount, totalDiscount: newTotalDiscount, finalAmount: newFinalAmount } = recalculateTotals(newGuests)

      setOrderData({
        ...orderData,
        guests: newGuests,
        totalAmount: newTotalAmount,
        totalDiscount: newTotalDiscount,
        finalAmount: newFinalAmount,
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

      // Пересчитываем скидку с учётом исключений
      let discountAmount = 0
      if (guest.discount?.type && guest.discount.value > 0) {
        const discountType = guest.discount.type === DiscountType.Percentage ? 'percentage' : 'fixed'
        const result = calculateDiscountWithExclusions(newItems.map(i => ({...i})), discountType, guest.discount.value)
        discountAmount = result.discountAmount
      }

      const newGuest: GuestOrder = {
        ...guest,
        items: newItems,
        totalAmount: newGuestTotal,
        discount: guest.discount ? { ...guest.discount, amount: discountAmount } : { type: DiscountType.None, value: 0, amount: 0 },
        finalAmount: newGuestTotal - discountAmount,
      }

      const newGuests = [...orderData.guests]
      newGuests[guestIndex] = newGuest
      const { totalAmount: newTotalAmount, totalDiscount: newTotalDiscount, finalAmount: newFinalAmount } = recalculateTotals(newGuests)

      setOrderData({
        ...orderData,
        guests: newGuests,
        totalAmount: newTotalAmount,
        totalDiscount: newTotalDiscount,
        finalAmount: newFinalAmount,
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

  // Process payment - перенаправляет на страницу оплаты
  const handlePayment = useCallback(() => {
    if (!orderData || orderData.finalAmount <= 0) return
    // Перенаправляем на страницу выбора способа оплаты
    navigate(`/payment/${orderId}`)
  }, [orderData, orderId, navigate])

  // Set discount for a guest
  const handleSetGuestDiscount = useCallback((guestNumber: number, type: DiscountType, value: number) => {
    if (!orderData) return

    const guestIndex = orderData.guests.findIndex(g => g.guestNumber === guestNumber)
    if (guestIndex === -1) return

    const guest = orderData.guests[guestIndex]

    // Вычисляем сумму скидки с учётом исключений
    let discountAmount = 0
    const discountType = type === DiscountType.Percentage ? 'percentage' : 'fixed'

    if (type === DiscountType.None || value === 0) {
      discountAmount = 0
    } else {
      // Используем функцию calculateDiscountWithExclusions для учёта исключённых товаров
      const result = calculateDiscountWithExclusions(guest.items, discountType, value)
      discountAmount = result.discountAmount
    }

    const newGuest: GuestOrder = {
      ...guest,
      discount: {
        type,
        value,
        amount: discountAmount,
      },
      finalAmount: guest.totalAmount - discountAmount,
    }

    const newGuests = [...orderData.guests]
    newGuests[guestIndex] = newGuest

    const { totalAmount: newTotalAmount, totalDiscount: newTotalDiscount, finalAmount: newFinalAmount } = recalculateTotals(newGuests)

    setOrderData({
      ...orderData,
      guests: newGuests,
      totalAmount: newTotalAmount,
      totalDiscount: newTotalDiscount,
      finalAmount: newFinalAmount,
    })
  }, [orderData, calculateDiscountWithExclusions])

  // Remove discount from a guest
  const handleRemoveGuestDiscount = useCallback((guestNumber: number) => {
    handleSetGuestDiscount(guestNumber, DiscountType.None, 0)
  }, [handleSetGuestDiscount])

  // Select customer for the order
  const handleCustomerSelect = useCallback((customer: Customer | null) => {
    if (!orderData) return
    const selectedGuestNumber = orderData.selectedGuestNumber

    const newGuests = orderData.guests.map((guest) => {
      if (customer?.id && guest.guestNumber !== selectedGuestNumber && guest.customer?.id === customer.id) {
        return {
          ...guest,
          customer: undefined,
          discount: { type: DiscountType.None, value: 0, amount: 0 },
          finalAmount: guest.totalAmount,
        }
      }
      return guest
    })

    const selectedGuestIndex = newGuests.findIndex((g) => g.guestNumber === selectedGuestNumber)
    if (selectedGuestIndex === -1) return

    const selectedGuest = newGuests[selectedGuestIndex]
    let discountType = DiscountType.None
    let discountValue = 0
    let discountAmount = 0

    const groupDiscount = Number((customer as any)?.group?.discount_percentage || 0)
    if (groupDiscount > 0) {
      discountType = DiscountType.Percentage
      discountValue = groupDiscount
      // Вычисляем скидку с учётом исключений
      const result = calculateDiscountWithExclusions(selectedGuest.items, 'percentage', discountValue)
      discountAmount = result.discountAmount
    }

    newGuests[selectedGuestIndex] = {
      ...selectedGuest,
      customer: customer || undefined,
      discount: {
        type: discountType,
        value: discountValue,
        amount: discountAmount,
      },
      finalAmount: selectedGuest.totalAmount - discountAmount,
    }

    const { totalAmount: newTotalAmount, totalDiscount: newTotalDiscount, finalAmount: newFinalAmount } = recalculateTotals(newGuests)
    setOrderData({
      ...orderData,
      guests: newGuests,
      selectedCustomer: customer || undefined,
      totalAmount: newTotalAmount,
      totalDiscount: newTotalDiscount,
      finalAmount: newFinalAmount,
    })
  }, [orderData, calculateDiscountWithExclusions])

  // Remove customer from order
  const handleCustomerRemove = useCallback(() => {
    if (!orderData) return
    const selectedGuestIndex = orderData.guests.findIndex(g => g.guestNumber === orderData.selectedGuestNumber)
    if (selectedGuestIndex === -1) return

    const newGuests = [...orderData.guests]
    const guest = newGuests[selectedGuestIndex]
    newGuests[selectedGuestIndex] = {
      ...guest,
      customer: undefined,
      discount: { type: DiscountType.None, value: 0, amount: 0 },
      finalAmount: guest.totalAmount,
    }

    const { totalAmount: newTotalAmount, totalDiscount: newTotalDiscount, finalAmount: newFinalAmount } = recalculateTotals(newGuests)
    setOrderData({
      ...orderData,
      guests: newGuests,
      selectedCustomer: undefined,
      totalAmount: newTotalAmount,
      totalDiscount: newTotalDiscount,
      finalAmount: newFinalAmount,
    })
  }, [orderData])

  return {
    // Data
    orderData,
    categories,
    products,
    technicalCards,
    selectedCategoryId,
    selectedTab,

    // Loading states
    isLoading: !orderData || isLoadingCategories,
    isLoadingCategories,
    isLoadingProducts,
    isCreatingOrder: false,
    error: null,

    // Actions
    handleBack,
    handleCategorySelect,
    handleProductClick,
    handleTechCardClick,
    handleGuestSelect,
    handleAddGuest,
    handleQuantityChange,
    handleRemoveItem,
    handleTabChange,
    handleSubmitOrder,
    handlePayment,

    // Customer actions
    handleCustomerSelect,
    handleCustomerRemove,

    // Discount actions
    handleSetGuestDiscount,
    handleRemoveGuestDiscount,

    // Computed
    selectedGuest,
    selectedCategoryProducts,
    selectedCategoryItems,

    // Exclusions
    checkAllItemsExcluded,

    // Promotions
    hasActivePromotions,
    activePromotions,
    getItemPromotionBadge,
    getItemIneligibilityReason,
    isPromotionsModalOpen,
    openPromotionsModal,
    closePromotionsModal,
  }
}
