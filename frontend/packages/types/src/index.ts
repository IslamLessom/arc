// ===== Базовые сущности =====

export interface Establishment {
  id: string
  ownerId: string
  name: string
  address?: string
  phone?: string
  email?: string
  hasSeatingPlaces: boolean
  tableCount?: number
  type?: string // restaurant, cafe, fast_food, bar, etc.
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Table {
  id: string
  establishmentId: string
  number: number
  name?: string
  capacity: number
  positionX: number
  positionY: number
  rotation: number
  status: 'available' | 'occupied' | 'reserved'
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Меню и товары =====

export interface Category {
  id: string
  establishmentId: string
  name: string
  type: 'product' | 'tech_card' | 'semi_finished'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  establishmentId: string
  categoryId: string
  category?: Category
  workshopId?: string
  workshop?: Workshop
  name: string
  description?: string
  coverImage?: string
  isWeighted: boolean
  excludeFromDiscounts: boolean
  hasModifications: boolean
  barcode?: string
  costPrice: number
  markup: number
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface TechCard {
  id: string
  establishmentId: string
  categoryId: string
  category?: Category
  workshopId?: string
  workshop?: Workshop
  name: string
  description?: string
  coverImage?: string
  isWeighted: boolean
  excludeFromDiscounts: boolean
  costPrice: number
  markup: number
  price: number
  active: boolean
  ingredients?: TechCardIngredient[]
  modifierSets?: ModifierSet[]
  createdAt: string
  updatedAt: string
}

export interface TechCardIngredient {
  id: string
  techCardId: string
  ingredientId: string
  ingredient?: Ingredient
  quantity: number
  unit: string
  createdAt: string
  updatedAt: string
}

export interface ModifierSet {
  id: string
  techCardId: string
  techCard?: TechCard
  name: string
  selectionType: 'single' | 'multiple'
  minSelection: number
  maxSelection: number
  options?: ModifierOption[]
  createdAt: string
  updatedAt: string
}

export interface ModifierOption {
  id: string
  modifierSetId: string
  modifierSet?: ModifierSet
  name: string
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Workshop {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Ингредиенты =====

export interface IngredientCategory {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  createdAt: string
  updatedAt: string
}

export interface Ingredient {
  id: string
  establishmentId: string
  categoryId: string
  category?: IngredientCategory
  name: string
  unit: string // шт, л, кг
  barcode?: string
  lossCleaning: number
  lossBoiling: number
  lossFrying: number
  lossStewing: number
  lossBaking: number
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Заказы =====

export type OrderStatus = 
  | 'draft' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'paid' 
  | 'cancelled'

export interface Order {
  id: string
  establishmentId: string
  establishment?: Establishment
  tableNumber?: number
  status: OrderStatus
  totalAmount: number
  guestsCount?: number
  items?: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  order?: Order
  productId?: string
  product?: Product
  techCardId?: string
  techCard?: TechCard
  quantity: number
  price: number
  totalPrice: number
  createdAt: string
}

// ===== Склад =====

export interface Warehouse {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  address?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Stock {
  id: string
  warehouseId: string
  warehouse?: Warehouse
  ingredientId?: string
  ingredient?: Ingredient
  productId?: string
  product?: Product
  quantity: number
  unit: string
  pricePerUnit: number
  limit: number
  updatedAt: string
}

export interface Supplier {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  taxpayerNumber?: string
  phone?: string
  address?: string
  comment?: string
  contact?: string
  email?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Supply {
  id: string
  warehouseId: string
  warehouse?: Warehouse
  supplierId: string
  supplier?: Supplier
  deliveryDateTime: string
  status: 'pending' | 'completed' | 'cancelled'
  comment?: string
  items?: SupplyItem[]
  createdAt: string
  updatedAt: string
}

export interface SupplyItem {
  id: string
  supplyId: string
  ingredientId?: string
  ingredient?: Ingredient
  productId?: string
  product?: Product
  quantity: number
  unit: string
  pricePerUnit: number
  totalAmount: number
  createdAt: string
}

export interface WriteOff {
  id: string
  warehouseId: string
  warehouse?: Warehouse
  writeOffDateTime: string
  write_off_date_time: string
  reason: string
  comment?: string
  items?: WriteOffItem[]
  createdAt: string
  updatedAt: string
}

export interface WriteOffItem {
  id: string
  writeOffId: string
  ingredientId?: string
  ingredient?: Ingredient
  productId?: string
  product?: Product
  quantity: number
  unit: string
  details?: string
  createdAt: string
}

// ===== Клиенты =====

export interface Client {
  id: string
  name?: string
  email?: string
  phone?: string
  loyaltyPoints: number
  loyaltyProgramId?: string
  loyaltyProgram?: LoyaltyProgram
  groupId?: string
  group?: ClientGroup
  createdAt: string
  updatedAt: string
}

export interface ClientGroup {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Promotion {
  id: string
  name: string
  description?: string
  type: string // discount, gift, etc.
  value: number
  startDate: string
  endDate: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Финансы =====

export interface AccountType {
  id: string
  name: string
  displayName: string
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: string
  establishmentId: string
  establishment?: Establishment
  name: string
  currency: string
  typeId: string
  type?: AccountType
  balance: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Shift {
  id: string
  establishmentId: string
  establishment?: Establishment
  employeeId: string
  employee?: User
  openedAt: string
  closedAt?: string
  openingBalance: number
  closingBalance?: number
  status: 'open' | 'closed'
  transactions?: Transaction[]
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  establishmentId: string
  establishment?: Establishment
  accountId: string
  account?: Account
  shiftId?: string
  shift?: Shift
  orderId?: string
  order?: Order
  type: 'income' | 'expense' | 'transfer'
  category?: string
  amount: number
  description?: string
  transactionDate: string
  createdAt: string
  updatedAt: string
}

// ===== Пользователи =====

export interface User {
  id: string
  email: string
  name?: string
  roleId: string
  role?: Role
  establishmentId?: string
  establishment?: Establishment
  onboardingCompleted: boolean
  subscriptionId?: string
  subscription?: Subscription
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  permissions?: string[]
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  name: string
  features?: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

// ===== Сервисы =====

export * from './services'

