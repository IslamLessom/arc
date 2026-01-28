import { CategoryTypeLabel } from '../model/enums'
import { CategoryType } from '../model/enums'
import { BoxIcon } from '@restaurant-pos/assets'
import { type SVGProps } from 'react'

// SVG Icons 16x16
export const ProductIcon = (props: SVGProps<SVGSVGElement>) => (
  <BoxIcon
    {...props}
    style={{ width: '16px', height: '16px', ...props.style }}
  />
)

export const TechCardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M3 3H13V13H3V3Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 6H11"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M5 8.5H9"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M5 11H7"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
)

export const SemiFinishedIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M8 2L14 5V11L8 14L2 11V5L8 2Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="8"
      cy="8"
      r="2.5"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M11 11L13 13"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M13 11L11 13"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
)

export const DefaultFolderIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M2 4C2 3.44772 2.44772 3 3 3H6L7.5 4.5H13C13.5523 4.5 14 4.94772 14 5.5V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

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

export const getCategoryIconComponent = (type: string) => {
  switch (type) {
    case CategoryType.Product:
      return ProductIcon
    case CategoryType.TechCard:
      return TechCardIcon
    case CategoryType.SemiFinished:
      return SemiFinishedIcon
    default:
      return DefaultFolderIcon
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
