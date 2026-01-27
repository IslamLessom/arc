import type { ReactNode } from 'react';
import { MenuItemId } from './enums';

export interface MenuItem {
  id: MenuItemId;
  label: string;
  icon: ReactNode;
  badge?: number | string;
  path: string;
  children?: MenuItem[];
}

export interface SidebarProps {
  currentPath?: string;
  userName?: string;
  userRole?: string;
}

export interface UseSidebarResult {
  activeItemId: MenuItemId;
  expandedItems: Set<MenuItemId>;
  handleItemClick: (itemId: MenuItemId, path: string) => void;
  handleToggleExpand: (itemId: MenuItemId) => void;
  isItemExpanded: (itemId: MenuItemId) => boolean;
  isItemActive: (itemId: MenuItemId) => boolean;
  hasActiveChild: (children?: MenuItem[]) => boolean;
  isUserDropdownOpen: boolean;
  handleToggleUserDropdown: () => void;
  handleLogout: () => Promise<void>;
  userDropdownRef: React.RefObject<HTMLDivElement>;
}
