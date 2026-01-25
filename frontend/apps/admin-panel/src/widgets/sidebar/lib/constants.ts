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
  },
];
