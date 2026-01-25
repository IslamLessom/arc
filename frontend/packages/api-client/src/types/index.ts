// Auth types
export type { LoginRequest, AuthUser, AuthResponse } from '../hooks/useAuth'
export type { CurrentUserResponse } from '../hooks/useCurrentUser'
export type { RegisterRequest } from '../hooks/useRegister'

// Onboarding types
export type {
  QuestionOption,
  OnboardingQuestion,
  QuestionsResponse,
  OnboardingAnswers,
  OnboardingRequest,
  OnboardingResponse,
} from '../hooks/useOnboarding'

// Stock types
export type {
  StockFilter,
  Category,
  Ingredient,
  Product,
  Warehouse,
  Stock,
} from '../hooks/useStock'

// Categories types
export type {
  CategoryFilter,
  ProductCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../hooks/useCategories'

// Ingredient Categories types
export type {
  IngredientCategoryFilter,
  IngredientCategory,
  CreateIngredientCategoryRequest,
  UpdateIngredientCategoryRequest,
} from '../hooks/useIngredientCategories'

// Semi-finished products types
export type {
  SemiFinishedFilter,
  SemiFinishedProduct,
  CreateSemiFinishedRequest,
  UpdateSemiFinishedRequest,
} from '../hooks/useSemiFinished'

// Ingredients types
export type {
  IngredientFilter,
  Ingredient,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from '../hooks/useIngredients'

// Warehouses types
export type {
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '../hooks/useWarehouses'