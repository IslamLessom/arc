export interface Workshop {
  id: string
  name: string
  print_slips: boolean
}

export interface WorkshopsFilters {
  searchQuery: string
}

export interface WorkshopsSort {
  field: keyof Workshop
  direction: 'asc' | 'desc'
}

