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
}

