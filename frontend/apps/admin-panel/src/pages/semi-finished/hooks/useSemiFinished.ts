import { useState } from 'react'
import {
  useGetSemiFinishedProducts,
  useCreateSemiFinishedProduct,
  useUpdateSemiFinishedProduct,
  useDeleteSemiFinishedProduct
} from '@restaurant-pos/api-client'
import type {
  SemiFinishedProduct,
  SemiFinishedFilter,
  CreateSemiFinishedRequest,
  UpdateSemiFinishedRequest
} from '@restaurant-pos/api-client'
import type { UseSemiFinishedResult } from '../model/types'

export const useSemiFinished = (): UseSemiFinishedResult => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SemiFinishedFilter>({})

  const {
    data: semiFinishedProducts,
    isLoading,
    error,
  } = useGetSemiFinishedProducts(filters)

  const handleFilterChange = (newFilters: Partial<SemiFinishedFilter>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
  }

  const createMutation = useCreateSemiFinishedProduct()
  const updateMutation = useUpdateSemiFinishedProduct()
  const deleteMutation = useDeleteSemiFinishedProduct()

  const handleCreateSemiFinished = async (data: CreateSemiFinishedRequest) => {
    await createMutation.mutateAsync(data)
  }

  const handleUpdateSemiFinished = async (id: string, data: UpdateSemiFinishedRequest) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const handleDeleteSemiFinished = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return {
    semiFinishedProducts,
    isLoading,
    error,
    filters,
    handleFilterChange,
    handleCreateSemiFinished,
    handleUpdateSemiFinished,
    handleDeleteSemiFinished,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    searchQuery,
    setSearchQuery,
  }
}