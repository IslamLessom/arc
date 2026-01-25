import { CategoryType, CategoryTypeLabel } from '../model/enums'

export const getCategoryIcon = (type: string): string => {
  switch (type) {
    case CategoryType.Product:
      return '📦'
    case CategoryType.TechCard:
      return '📄'
    case CategoryType.SemiFinished:
      return '🔧'
    default:
      return '📁'
  }
}

export const getCategoryTypeLabel = (type: string): string => {
  switch (type) {
    case CategoryType.Product:
      return CategoryTypeLabel.Product
    case CategoryType.TechCard:
      return CategoryTypeLabel.TechCard
    case CategoryType.SemiFinished:
      return CategoryTypeLabel.SemiFinished
    default:
      return type
  }
}