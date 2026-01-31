import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { Account, AccountType } from '@restaurant-pos/types'

interface AccountsResponse {
  data: Account[]
}

interface AccountResponse {
  data: Account
}

interface AccountTypesResponse {
  data: AccountType[]
}

interface CreateAccountRequest {
  name: string
  currency: string
  typeId: string
  balance: number
}

interface UpdateAccountRequest {
  name?: string
  currency?: string
  typeId?: string
  active?: boolean
}

export function useGetAccounts(typeId?: string, active?: boolean, search?: string) {
  return useQuery({
    queryKey: ['accounts', typeId, active, search],
    queryFn: async (): Promise<Account[]> => {
      const params = new URLSearchParams()
      if (typeId) params.set('typeId', typeId)
      if (active !== undefined) params.set('active', String(active))
      if (search) params.set('search', search)

      const url = '/finance/accounts' + (params.toString() ? `?${params}` : '')
      const response = await apiClient.get<AccountsResponse>(url)
      return response.data.data
    },
  })
}

export function useGetAccount(id: string) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: async (): Promise<Account> => {
      const response = await apiClient.get<AccountResponse>(`/finance/accounts/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAccountRequest): Promise<Account> => {
      const response = await apiClient.post<AccountResponse>(
        '/finance/accounts',
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateAccountRequest
    }): Promise<Account> => {
      const response = await apiClient.put<AccountResponse>(
        `/finance/accounts/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/finance/accounts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useGetAccountTypes() {
  return useQuery({
    queryKey: ['account-types'],
    queryFn: async (): Promise<AccountType[]> => {
      const response = await apiClient.get<AccountTypesResponse>(
        '/finance/account-types'
      )
      return response.data.data
    },
  })
}
