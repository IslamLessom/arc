/**
 * useQRMenu — хуки для публичного QR-меню (не требуют JWT сотрудника).
 * Используют отдельный axios-клиент без заголовков авторизации заведения.
 */
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'

const getBaseURL = (): string => {
  const proc = (globalThis as { process?: { env?: Record<string, string> } }).process
  if (proc?.env) {
    return proc.env['VITE_API_URL'] || proc.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:8081/api/v1'
  }
  return 'http://localhost:8081/api/v1'
}

// Отдельный клиент для QR-меню: токен гостя хранится в sessionStorage
const qrClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

qrClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const guestToken = sessionStorage.getItem('qr_guest_token')
    if (guestToken) {
      config.headers.Authorization = `Bearer ${guestToken}`
    }
  }
  return config
})

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QRTableInfo {
  establishment: {
    id: string
    name: string
    address?: string
    phone?: string
    type?: string
  }
  table: {
    id: string
    number: number
    name?: string
    capacity: number
    status: string
  }
}

export interface QRProduct {
  id: string
  name: string
  description?: string
  cover_image?: string
  price: number
  is_weighted?: boolean
  cost_price?: number
  markup?: number
  active?: boolean
  category_id?: string
}

export interface QRMenuCategory {
  id: string
  name: string
  products: QRProduct[]
}

export interface GuestSession {
  id: string
  establishment_id: string
  table_id?: string
  guest_name: string
  phone?: string
  is_anonymous: boolean
  token: string
  created_at: string
}

export interface GuestSessionResponse {
  token: string
  guest_name: string
  is_anonymous: boolean
  session: GuestSession
}

export interface QROrderItem {
  product_id?: string
  tech_card_id?: string
  quantity: number
}

export interface QROrder {
  id: string
  establishment_id: string
  table_id?: string
  table_number?: number
  status: string
  payment_status: string
  total_amount: number
  source: 'qr_menu'
  guest_name?: string
  items?: Array<{
    id: string
    product_id?: string
    tech_card_id?: string
    product?: QRProduct
    tech_card?: {
      id: string
      name: string
      price: number
      cover_image?: string
      description?: string
    }
    quantity: number
    price: number
    total_price: number
  }>
  created_at: string
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Получить информацию о столе и заведении по QR-токену */
export function useQRTableInfo(qrToken: string) {
  return useQuery<QRTableInfo>({
    queryKey: ['qr', 'info', qrToken],
    queryFn: async () => {
      const { data } = await qrClient.get<QRTableInfo>(`/qr/${qrToken}`)
      return data
    },
    enabled: !!qrToken,
    staleTime: 1000 * 60 * 5,
  })
}

/** Получить публичное меню */
export function useQRMenu(qrToken: string) {
  return useQuery<QRMenuCategory[]>({
    queryKey: ['qr', 'menu', qrToken],
    queryFn: async () => {
      const { data } = await qrClient.get<QRMenuCategory[]>(`/qr/${qrToken}/menu`)
      return data
    },
    enabled: !!qrToken,
    staleTime: 1000 * 60 * 5,
  })
}

/** Создать анонимную гостевую сессию */
export function useCreateGuestSession() {
  return useMutation({
    mutationFn: async ({ qrToken, guestName }: { qrToken: string; guestName: string }) => {
      const { data } = await qrClient.post<GuestSessionResponse>(`/qr/${qrToken}/session`, {
        guest_name: guestName,
      })
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('qr_guest_token', data.token)
        sessionStorage.setItem('qr_guest_name', data.guest_name)
        sessionStorage.setItem('qr_is_anonymous', String(data.is_anonymous))
      }
      return data
    },
  })
}

/** Зарегистрировать гостя (телефон + пароль) */
export function useRegisterGuest() {
  return useMutation({
    mutationFn: async ({
      qrToken,
      guestName,
      phone,
      password,
    }: {
      qrToken: string
      guestName: string
      phone: string
      password: string
    }) => {
      const { data } = await qrClient.post<GuestSessionResponse>(`/qr/${qrToken}/register`, {
        guest_name: guestName,
        phone,
        password,
      })
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('qr_guest_token', data.token)
        sessionStorage.setItem('qr_guest_name', data.guest_name)
        sessionStorage.setItem('qr_is_anonymous', 'false')
      }
      return data
    },
  })
}

/** Войти как зарегистрированный гость */
export function useLoginGuest() {
  return useMutation({
    mutationFn: async ({
      qrToken,
      phone,
      password,
    }: {
      qrToken: string
      phone: string
      password: string
    }) => {
      const { data } = await qrClient.post<GuestSessionResponse>(`/qr/${qrToken}/login`, {
        phone,
        password,
      })
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('qr_guest_token', data.token)
        sessionStorage.setItem('qr_guest_name', data.guest_name)
        sessionStorage.setItem('qr_is_anonymous', 'false')
      }
      return data
    },
  })
}

/** Создать заказ через QR-меню */
export function useCreateQROrder(qrToken: string) {
  return useMutation({
    mutationFn: async (items: QROrderItem[]) => {
      const { data } = await qrClient.post<QROrder>(`/qr/${qrToken}/orders`, { items })
      return data
    },
  })
}

/** Получить мои заказы в текущей сессии */
export function useMyQROrders(qrToken: string) {
  return useQuery<QROrder[]>({
    queryKey: ['qr', 'my-orders', qrToken],
    queryFn: async () => {
      const { data } = await qrClient.get<QROrder[]>(`/qr/${qrToken}/orders`)
      return data
    },
    enabled: !!qrToken && typeof window !== 'undefined' && !!sessionStorage.getItem('qr_guest_token'),
    refetchInterval: 10000,
  })
}
