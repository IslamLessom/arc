export interface TechnicalCard {
  id: string
  name: string
  category: string
  ingredients: number
  weight: number
  cost: number
  price: number
  margin: number
  status: string
  lastModified: string
}

export interface TechnicalCardsFilters {
  searchQuery: string
  category: string
  status: string
}

export interface TechnicalCardsSort {
  field: keyof TechnicalCard
  direction: 'asc' | 'desc'
}