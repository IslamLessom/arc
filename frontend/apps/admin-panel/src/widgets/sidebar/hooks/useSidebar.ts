import { useState, useEffect, useRef, useCallback } from 'react';
import { MenuItemId } from '../model/enums';
import type { SidebarProps, MenuItem as MenuItemType } from '../model/types';
import { apiClient } from '@restaurant-pos/api-client';

interface UseSidebarResult {
  activeItemId: MenuItemId;
  expandedItems: Set<MenuItemId>;
  handleItemClick: (itemId: MenuItemId, path: string) => void;
  handleToggleExpand: (itemId: MenuItemId) => void;
  isItemExpanded: (itemId: MenuItemId) => boolean;
  isItemActive: (itemId: MenuItemId) => boolean;
  hasActiveChild: (children?: MenuItemType[]) => boolean;
  isUserDropdownOpen: boolean;
  handleToggleUserDropdown: () => void;
  handleLogout: () => Promise<void>;
  userDropdownRef: React.RefObject<HTMLDivElement>;
}

export const useSidebar = (props: SidebarProps): UseSidebarResult => {
  const { currentPath } = props;

  const getActiveItemId = (): MenuItemId => {
    if (!currentPath) return MenuItemId.GettingStarted;
    
    const pathMap: Record<string, MenuItemId> = {
      '/': MenuItemId.GettingStarted,
      '/statistics': MenuItemId.Statistics,
      '/finance': MenuItemId.Finance,
      '/menu': MenuItemId.Menu,
      '/warehouse': MenuItemId.Warehouse,
      '/warehouse/balances': MenuItemId.WarehouseBalances,
      '/warehouse/deliveries': MenuItemId.WarehouseDeliveries,
      '/warehouse/processing': MenuItemId.WarehouseProcessing,
      '/warehouse/movements': MenuItemId.WarehouseMovements,
      '/warehouse/write-offs': MenuItemId.WarehouseWriteOffs,
      '/warehouse/movement-report': MenuItemId.WarehouseMovementReport,
      '/warehouse/inventories': MenuItemId.WarehouseInventories,
      '/warehouse/suppliers': MenuItemId.WarehouseSuppliers,
      '/warehouse/warehouses': MenuItemId.WarehouseWarehouses,
      '/warehouse/packaging': MenuItemId.WarehousePackaging,
      '/marketing': MenuItemId.Marketing,
      '/access': MenuItemId.Access,
      '/all-applications': MenuItemId.AllApplications,
      '/settings': MenuItemId.Settings,
    };

    return pathMap[currentPath] || MenuItemId.GettingStarted;
  };

  const [activeItemId, setActiveItemId] = useState<MenuItemId>(getActiveItemId());
  const [expandedItems, setExpandedItems] = useState<Set<MenuItemId>>(new Set());
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeId = getActiveItemId();
    setActiveItemId(activeId);
    
    // Автоматически раскрыть родительский элемент, если активен подпункт
    const warehouseSubItems = [
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
    ];
    
    if (warehouseSubItems.includes(activeId)) {
      setExpandedItems(prev => new Set(prev).add(MenuItemId.Warehouse));
    }
  }, [currentPath]);

  const handleItemClick = (itemId: MenuItemId, path: string) => {
    setActiveItemId(itemId);
    // Здесь можно добавить навигацию через react-router или другой роутер
    window.location.href = path;
  };

  const handleToggleExpand = (itemId: MenuItemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isItemExpanded = (itemId: MenuItemId) => expandedItems.has(itemId);
  const isItemActive = (itemId: MenuItemId) => activeItemId === itemId;
  const hasActiveChild = (children?: MenuItemType[]) => {
    if (!children) return false;
    return children.some(child => isItemActive(child.id));
  };

  const handleToggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем токены из localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      // Редиректим на страницу авторизации
      window.location.href = '/auth';
    }
  }, []);

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return {
    activeItemId,
    expandedItems,
    handleItemClick,
    handleToggleExpand,
    isItemExpanded,
    isItemActive,
    hasActiveChild,
    isUserDropdownOpen,
    handleToggleUserDropdown,
    handleLogout,
    userDropdownRef,
  };
};

