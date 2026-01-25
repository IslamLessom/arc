export interface Ingredient {
  id: string
  name: string
  category: string
  measureUnit: string
  count: number
  stock: number
  cost: number
  supplier?: string
  lastDelivery?: string
}

export interface IngredientsFilter {
  category?: string
  supplier?: string
  inStock?: boolean
}

export interface IngredientsSort {
  field: keyof Ingredient
  direction: 'asc' | 'desc'
}