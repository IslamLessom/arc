export interface AddPositionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  positionId?: string
}

export interface AdminPanelSection {
  id: string
  name: string
}

export interface SalaryCategory {
  id: string
  name: string
}

export type AccessLevel = 'none' | 'view' | 'full'

export interface AddPositionFormData {
  name: string
  cashAccess: {
    workWithCash: boolean
    adminHall: boolean
  }
  adminPanelAccess: Record<string, AccessLevel>
  applicationsAccess: {
    confirmInstallation: boolean
  }
  salaryCalculation: {
    fixedRate: {
      perHour?: string
      perShift?: string
      perMonth?: string
    }
    personalSalesPercentage: {
      categoryId?: string
      percentage?: string
    }
    shiftSalesPercentage: {
      categoryId?: string
      percentage?: string
    }
  }
}

export interface FieldErrors {
  name?: string
}

export const ADMIN_PANEL_SECTIONS: AdminPanelSection[] = [
  { id: 'statistics', name: 'Статистика' },
  { id: 'finances', name: 'Финансы' },
  { id: 'salary', name: 'Зарплата' },
  { id: 'menu', name: 'Меню' },
  { id: 'warehouse', name: 'Склад' },
  { id: 'employees', name: 'Сотрудники' },
  { id: 'reports', name: 'Отчеты' },
  { id: 'settings', name: 'Настройки' },
]

export const SALARY_CATEGORIES: SalaryCategory[] = [
  { id: 'all', name: 'Все категории' },
  { id: 'food', name: 'Еда' },
  { id: 'drinks', name: 'Напитки' },
]
