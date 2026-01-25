import type { SemiFinishedProduct, SemiFinishedFilter, CreateSemiFinishedRequest, UpdateSemiFinishedRequest } from '@restaurant-pos/api-client'

export interface UseSemiFinishedResult {
  semiFinishedProducts: SemiFinishedProduct[] | undefined
  isLoading: boolean
  error: Error | null
  filters: SemiFinishedFilter
  handleFilterChange: (filters: Partial<SemiFinishedFilter>) => void
  handleCreateSemiFinished: (data: CreateSemiFinishedRequest) => Promise<void>
  handleUpdateSemiFinished: (id: string, data: UpdateSemiFinishedRequest) => Promise<void>
  handleDeleteSemiFinished: (id: string) => Promise<void>
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
}

