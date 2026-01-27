import { ADMIN_PANEL_SECTIONS } from '../model/types'

export const ADMIN_PANEL_SECTION_LABELS: Record<string, string> = {
  statistics: 'Статистика',
  finances: 'Финансы',
  salary: 'Зарплата',
  menu: 'Меню',
  warehouse: 'Склад',
  employees: 'Сотрудники',
  reports: 'Отчеты',
  settings: 'Настройки',
}

export const SALARY_CATEGORIES = [
  { id: 'all', name: 'Все категории' },
  { id: 'food', name: 'Еда' },
  { id: 'drinks', name: 'Напитки' },
]

export const DEFAULT_ADMIN_PANEL_ACCESS = ADMIN_PANEL_SECTIONS.reduce((acc, section) => {
  acc[section.id] = 'none'
  return acc
}, {} as Record<string, string>)

export const HELP_TOOLTIPS = {
  adminHall: 'Администрирование зала — доступ к управлению залом',
  perHour: 'Оплата за час работы',
  perShift: 'Оплата за смену',
  perMonth: 'Оплата за месяц',
  personalSales: 'Процент от личных продаж сотрудника',
  shiftSales: 'Процент от продаж за смену',
  confirmInstallation: 'Подтверждение установки приложений сотрудником',
}
