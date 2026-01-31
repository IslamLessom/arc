import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { Transaction } from '@restaurant-pos/types'

interface BackendTransaction {
  id: string
  establishment_id: string
  establishment?: any
  account_id: string
  account?: any
  shift_id?: string
  shift?: any
  order_id?: string
  order?: any
  type: 'income' | 'expense' | 'transfer'
  category?: string
  amount: number
  description?: string
  transaction_date: string
  created_at: string
  updated_at: string
}

interface TransactionsResponse {
  data: BackendTransaction[]
}

interface TransactionResponse {
  data: BackendTransaction
}

interface TransactionFilter {
  accountId?: string
  type?: 'income' | 'expense' | 'transfer'
  category?: string
  startDate?: string
  endDate?: string
  search?: string
}

interface CreateTransactionRequest {
  account_id: string
  type: 'income' | 'expense' | 'transfer'
  category?: string
  amount: number
  description?: string
  transaction_date?: string
  shift_id?: string
  order_id?: string
}

interface UpdateTransactionRequest {
  account_id?: string
  type?: 'income' | 'expense' | 'transfer'
  category?: string
  amount?: number
  description?: string
  transaction_date?: string
}

// Transform backend transaction to frontend Transaction type
function transformTransaction(backend: BackendTransaction): Transaction {
  return {
    id: backend.id,
    establishmentId: backend.establishment_id,
    establishment: backend.establishment,
    accountId: backend.account_id,
    account: backend.account,
    shiftId: backend.shift_id,
    shift: backend.shift,
    orderId: backend.order_id,
    order: backend.order,
    type: backend.type,
    category: backend.category,
    amount: backend.amount,
    description: backend.description,
    transactionDate: backend.transaction_date,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}

export function useGetTransactions(filter?: TransactionFilter) {
  return useQuery({
    queryKey: ['transactions', filter],
    queryFn: async (): Promise<Transaction[]> => {
      const params = new URLSearchParams()
      if (filter?.accountId) params.set('account_id', filter.accountId)
      if (filter?.type) params.set('type', filter.type)
      if (filter?.category) params.set('category', filter.category)
      if (filter?.startDate) params.set('start_date', filter.startDate)
      if (filter?.endDate) params.set('end_date', filter.endDate)
      if (filter?.search) params.set('search', filter.search)

      const url = '/finance/transactions' + (params.toString() ? `?${params}` : '')
      const response = await apiClient.get<TransactionsResponse>(url)
      return response.data.data.map(transformTransaction)
    },
  })
}

export function useGetTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async (): Promise<Transaction> => {
      const response = await apiClient.get<TransactionResponse>(`/finance/transactions/${id}`)
      return transformTransaction(response.data.data)
    },
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTransactionRequest): Promise<Transaction> => {
      const response = await apiClient.post<TransactionResponse>(
        '/finance/transactions',
        data
      )
      return transformTransaction(response.data.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateTransactionRequest
    }): Promise<Transaction> => {
      const response = await apiClient.put<TransactionResponse>(
        `/finance/transactions/${id}`,
        data
      )
      return transformTransaction(response.data.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/finance/transactions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export type { TransactionFilter, CreateTransactionRequest, UpdateTransactionRequest }
