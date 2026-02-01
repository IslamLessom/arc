import { MenuItemId } from '../model/enums';
import type { MenuItem } from '../model/types';

export const menuItems: MenuItem[] = [
  {
    id: MenuItemId.GettingStarted,
    label: 'Начало работы',
    icon: '🏠',
    badge: 3,
    path: '/',
  },
  {
    id: MenuItemId.Statistics,
    label: 'Статистика',
    icon: '📊',
    path: '/statistics',
  },
  {
    id: MenuItemId.Finance,
    label: 'Финансы',
    icon: '💰',
    path: '/finance',
    children: [
      {
        id: MenuItemId.FinanceTransactions,
        label: 'Транзакции',
        icon: '💳',
        path: '/finance/transactions',
      },
      {
        id: MenuItemId.FinanceCashFlow,
        label: 'Поток денег',
        icon: '💵',
        path: '/finance/cash-flow',
      },
      {
        id: MenuItemId.FinanceCashRegisterShifts,
        label: 'Кассовые смены',
        icon: '🕐',
        path: '/finance/cash-register-shifts',
      },
      {
        id: MenuItemId.FinanceSalary,
        label: 'Зарплата',
        icon: '💸',
        path: '/finance/salary',
      },
      {
        id: MenuItemId.FinanceInvoices,
        label: 'Счета',
        icon: '📄',
        path: '/finance/invoices',
      },
      {
        id: MenuItemId.FinanceCategories,
        label: 'Категории',
        icon: '🏷️',
        path: '/finance/categories',
      },
      {
        id: MenuItemId.FinanceProfitAndLoss,
        label: 'P&L',
        icon: '📊',
        path: '/finance/profit-and-loss',
      },
    ],
  },
  {
    id: MenuItemId.Menu,
    label: 'Меню',
    icon: '📋',
    path: '/menu',
    children: [
      {
        id: MenuItemId.MenuProducts,
        label: 'Товары',
        icon: '📦',
        path: '/menu/products',
      },
      {
        id: MenuItemId.MenuTechCards,
        label: 'Тех. карты',
        icon: '📄',
        path: '/menu/tech-cards',
      },
      {
        id: MenuItemId.MenuSemiFinished,
        label: 'Полуфабрикаты',
        icon: '🔧',
        path: '/menu/semi-finished',
      },
      {
        id: MenuItemId.MenuIngredients,
        label: 'Ингредиенты',
        icon: '🥄',
        path: '/menu/ingredients',
      },
      {
        id: MenuItemId.MenuProductCategories,
        label: 'Категории товаров и тех. карт',
        icon: '📁',
        path: '/menu/product-categories',
      },
      {
        id: MenuItemId.MenuIngredientCategories,
        label: 'Категории ингредиентов',
        icon: '📂',
        path: '/menu/ingredient-categories',
      },
      {
        id: MenuItemId.MenuWorkshops,
        label: 'Цехи',
        icon: '🏭',
        path: '/menu/workshops',
      },
    ],
  },
  {
    id: MenuItemId.Warehouse,
    label: 'Склад',
    icon: '📦',
    path: '/warehouse',
    children: [
      {
        id: MenuItemId.WarehouseBalances,
        label: 'Остатки',
        icon: '📊',
        path: '/warehouse/balances',
      },
      {
        id: MenuItemId.WarehouseDeliveries,
        label: 'Поставки',
        icon: '🚚',
        path: '/warehouse/deliveries',
      },
      {
        id: MenuItemId.WarehouseProcessing,
        label: 'Переработки',
        icon: '🔄',
        badge: 'New',
        path: '/warehouse/processing',
      },
      {
        id: MenuItemId.WarehouseMovements,
        label: 'Перемещения',
        icon: '↔️',
        path: '/warehouse/movements',
      },
      {
        id: MenuItemId.WarehouseWriteOffs,
        label: 'Списания',
        icon: '📉',
        path: '/warehouse/write-offs',
      },
      {
        id: MenuItemId.WarehouseMovementReport,
        label: 'Отчёт по движению',
        icon: '📈',
        path: '/warehouse/movement-report',
      },
      {
        id: MenuItemId.WarehouseInventories,
        label: 'Инвентаризации',
        icon: '🔍',
        path: '/warehouse/inventories',
      },
      {
        id: MenuItemId.WarehouseSuppliers,
        label: 'Поставщики',
        icon: '🏭',
        path: '/warehouse/suppliers',
      },
      {
        id: MenuItemId.WarehouseWarehouses,
        label: 'Склады',
        icon: '🏬',
        path: '/warehouse/warehouses',
      },
      {
        id: MenuItemId.WarehousePackaging,
        label: 'Фасовки',
        icon: '📦',
        path: '/warehouse/packaging',
      },
    ],
  },
  {
    id: MenuItemId.Marketing,
    label: 'Маркетинг',
    icon: '📢',
    path: '/marketing',
  },
  {
    id: MenuItemId.Access,
    label: 'Доступ',
    icon: '🔐',
    path: '/access',
    children: [
      {
        id: MenuItemId.AccessEmployees,
        label: 'Сотрудники',
        icon: '👥',
        path: '/access/employees',
      },
      {
        id: MenuItemId.AccessPositions,
        label: 'Должности',
        icon: '👔',
        path: '/access/positions',
      },
      //{
        //id: MenuItemId.AccessCashRegisters,
        //label: 'Кассы',
        //icon: '💰',
        //path: '/access/cash-registers',
      //},
      //{
        //id: MenuItemId.AccessEstablishments,
        //label: 'Заведения',
        //icon: '🏢',
        //path: '/access/establishments',
      //},
    ],
  },
  {
    id: MenuItemId.AllApplications,
    label: 'Все приложения',
    icon: '⊞',
    path: '/all-applications',
  },
  {
    id: MenuItemId.Settings,
    label: 'Настройки',
    icon: '⚙️',
    path: '/settings',
    children: [
      {
        id: MenuItemId.SettingsTables,
        label: 'Столы',
        icon: '🪑',
        path: '/settings/tables',
      },
    ],
  },
];

export const PATH_PATTERNS: Array<[string, MenuItemId]> = [
  ['/', MenuItemId.GettingStarted],
  ['/statistics', MenuItemId.Statistics],
  ['/finance', MenuItemId.Finance],
  ['/finance/transactions', MenuItemId.FinanceTransactions],
  ['/finance/cash-flow', MenuItemId.FinanceCashFlow],
  ['/finance/cash-register-shifts', MenuItemId.FinanceCashRegisterShifts],
  ['/finance/salary', MenuItemId.FinanceSalary],
  ['/finance/invoices', MenuItemId.FinanceInvoices],
  ['/finance/categories', MenuItemId.FinanceCategories],
  ['/finance/profit-and-loss', MenuItemId.FinanceProfitAndLoss],
  ['/menu', MenuItemId.Menu],
  ['/menu/products', MenuItemId.MenuProducts],
  ['/menu/tech-cards', MenuItemId.MenuTechCards],
  ['/menu/semi-finished', MenuItemId.MenuSemiFinished],
  ['/menu/ingredients', MenuItemId.MenuIngredients],
  ['/menu/product-categories', MenuItemId.MenuProductCategories],
  ['/menu/ingredient-categories', MenuItemId.MenuIngredientCategories],
  ['/menu/workshops', MenuItemId.MenuWorkshops],
  ['/warehouse', MenuItemId.Warehouse],
  ['/warehouse/balances', MenuItemId.WarehouseBalances],
  ['/warehouse/deliveries', MenuItemId.WarehouseDeliveries],
  ['/warehouse/processing', MenuItemId.WarehouseProcessing],
  ['/warehouse/movements', MenuItemId.WarehouseMovements],
  ['/warehouse/write-offs', MenuItemId.WarehouseWriteOffs],
  ['/warehouse/movement-report', MenuItemId.WarehouseMovementReport],
  ['/warehouse/inventories', MenuItemId.WarehouseInventories],
  ['/warehouse/suppliers', MenuItemId.WarehouseSuppliers],
  ['/warehouse/warehouses', MenuItemId.WarehouseWarehouses],
  ['/warehouse/packaging', MenuItemId.WarehousePackaging],
  ['/marketing', MenuItemId.Marketing],
  ['/access', MenuItemId.Access],
  ['/access/employees', MenuItemId.AccessEmployees],
  ['/access/positions', MenuItemId.AccessPositions],
  ['/access/cash-registers', MenuItemId.AccessCashRegisters],
  ['/access/establishments', MenuItemId.AccessEstablishments],
  ['/access/integrations', MenuItemId.AccessIntegrations],
  ['/all-applications', MenuItemId.AllApplications],
  ['/settings', MenuItemId.Settings],
  ['/settings/tables', MenuItemId.SettingsTables],
];

export const WAREHOUSE_SUB_ITEMS = [
  MenuItemId.WarehouseBalances,
  MenuItemId.WarehouseDeliveries,
  MenuItemId.WarehouseProcessing,
  MenuItemId.WarehouseMovements,
  MenuItemId.WarehouseWriteOffs,
  MenuItemId.WarehouseMovementReport,
  MenuItemId.WarehouseInventories,
  MenuItemId.WarehouseSuppliers,
  MenuItemId.WarehouseWarehouses,
  MenuItemId.WarehousePackaging,
] as const;

export const MENU_SUB_ITEMS = [
  MenuItemId.MenuProducts,
  MenuItemId.MenuTechCards,
  MenuItemId.MenuSemiFinished,
  MenuItemId.MenuIngredients,
  MenuItemId.MenuProductCategories,
  MenuItemId.MenuIngredientCategories,
  MenuItemId.MenuWorkshops,
] as const;

export const ACCESS_SUB_ITEMS = [
  MenuItemId.AccessEmployees,
  MenuItemId.AccessPositions,
  MenuItemId.AccessCashRegisters,
  MenuItemId.AccessEstablishments,
  MenuItemId.AccessIntegrations,
] as const;

export const FINANCE_SUB_ITEMS = [
  MenuItemId.FinanceTransactions,
  MenuItemId.FinanceCashFlow,
  MenuItemId.FinanceCashRegisterShifts,
  MenuItemId.FinanceSalary,
  MenuItemId.FinanceInvoices,
  MenuItemId.FinanceCategories,
  MenuItemId.FinanceProfitAndLoss,
] as const;

export const SETTINGS_SUB_ITEMS = [
  MenuItemId.SettingsTables,
] as const;
