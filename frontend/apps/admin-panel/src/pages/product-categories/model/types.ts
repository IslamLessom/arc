import type {
  ProductCategory,
  CategoryFilter,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@restaurant-pos/api-client'

export interface UseProductCategoriesResult {
  categories: ProductCategory[] | undefined
  isLoading: boolean
  error: Error | null
  filters: CategoryFilter
  handleFilterChange: (filters: Partial<CategoryFilter>) => void
  handleCreateCategory: (data: CreateCategoryRequest) => Promise<void>
  handleUpdateCategory: (id: string, data: UpdateCategoryRequest) => Promise<void>
  handleDeleteCategory: (id: string) => Promise<void>
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  refetchCategories: () => Promise<unknown>
}

export interface CategoryTableRow {
  id: string
  name: string
  type: string
  order: number
  active: boolean
}

