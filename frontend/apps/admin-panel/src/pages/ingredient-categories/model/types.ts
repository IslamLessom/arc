import type {
  IngredientCategory,
  IngredientCategoryFilter,
  CreateIngredientCategoryRequest,
  UpdateIngredientCategoryRequest,
} from '@restaurant-pos/api-client'

export interface CategoryTotals {
  totalIngredientCount: number
  totalStock: number
  totalValue: number
}

export interface UseIngredientCategoriesResult {
  categories: IngredientCategoryTableRow[]
  isLoading: boolean
  error: Error | null
  filters: IngredientCategoryFilter
  handleFilterChange: (filters: Partial<IngredientCategoryFilter>) => void
  handleCreateCategory: (data: CreateIngredientCategoryRequest) => Promise<void>
  handleUpdateCategory: (
    id: string,
    data: UpdateIngredientCategoryRequest
  ) => Promise<void>
  handleDeleteCategory: (id: string) => Promise<void>
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBack: () => void
  handleDelete: (id: string) => Promise<void>
  handleEdit: (id: string) => void
  handleAdd: () => void
  handleExport: () => void
  handlePrint: () => void
  handleColumns: () => void
  isModalOpen: boolean
  handleCloseModal: () => void
  handleCategoryCreated: () => void
  totals: CategoryTotals
}

export interface IngredientCategoryTableRow {
  id: string
  name: string
  ingredientCount: number
  totalStock: number
  totalValue: number
}

