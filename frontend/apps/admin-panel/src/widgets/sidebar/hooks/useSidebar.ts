import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItemId } from '../model/enums';
import type { SidebarProps, MenuItem, UseSidebarResult } from '../model/types';
import { apiClient } from '@restaurant-pos/api-client';
import { PATH_PATTERNS, WAREHOUSE_SUB_ITEMS, MENU_SUB_ITEMS, ACCESS_SUB_ITEMS, SETTINGS_SUB_ITEMS } from '../lib/constants';

export const useSidebar = (props: SidebarProps): UseSidebarResult => {
  const { currentPath } = props;
  const navigate = useNavigate();

  const getActiveItemId = (): MenuItemId => {
    if (!currentPath) return MenuItemId.GettingStarted;

    const sortedPatterns = PATH_PATTERNS.sort((a, b) => b[0].length - a[0].length);

    for (const [basePath, menuItemId] of sortedPatterns) {
      if (currentPath === basePath || currentPath.startsWith(basePath + '/')) {
        return menuItemId;
      }
    }

    return MenuItemId.GettingStarted;
  };

  const [activeItemId, setActiveItemId] = useState<MenuItemId>(getActiveItemId());
  const [expandedItems, setExpandedItems] = useState<Set<MenuItemId>>(new Set());
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeId = getActiveItemId();
    setActiveItemId(activeId);

    if (WAREHOUSE_SUB_ITEMS.includes(activeId)) {
      setExpandedItems(prev => new Set(prev).add(MenuItemId.Warehouse));
    }

    if (MENU_SUB_ITEMS.includes(activeId)) {
      setExpandedItems(prev => new Set(prev).add(MenuItemId.Menu));
    }

    if (ACCESS_SUB_ITEMS.includes(activeId)) {
      setExpandedItems(prev => new Set(prev).add(MenuItemId.Access));
    }

    if (SETTINGS_SUB_ITEMS.includes(activeId)) {
      setExpandedItems(prev => new Set(prev).add(MenuItemId.Settings));
    }
  }, [currentPath]);

  const handleItemClick = (itemId: MenuItemId, path: string) => {
    setActiveItemId(itemId);
    navigate(path);
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
  const hasActiveChild = (children?: MenuItem[]) => {
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
      navigate('/auth');
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

