import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'

export interface Role {
  id: string
  name: string
  permissions: string
  created_at: string
  updated_at: string
}

interface RolesResponse {
  data: Role[]
}

export function useGetRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      const response = await apiClient.get<RolesResponse>('/roles')
      return response.data.data
    },
  })
}
