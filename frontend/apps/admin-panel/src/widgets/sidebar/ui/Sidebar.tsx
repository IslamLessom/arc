import { useSidebar } from '../hooks/useSidebar';
import type { SidebarProps } from '../model/types';
import { menuItems } from '../lib/constants';
import * as Styled from '../styled';
import { Button } from '@restaurant-pos/ui';

export const Sidebar = (props: SidebarProps) => {
  const {
    handleItemClick,
    handleToggleExpand,
    isItemExpanded,
    isItemActive,
    hasActiveChild,
    isUserDropdownOpen,
    handleToggleUserDropdown,
    handleLogout,
    userDropdownRef,
  } = useSidebar(props);
  const { userName = 'Maki' } = props;

  return (
    <Styled.SidebarContainer>
      <Styled.Header>
        <Styled.BackButton>←</Styled.BackButton>
        <Button>Poster</Button>
        <Styled.LampIcon>💡</Styled.LampIcon>
      </Styled.Header>

      <Styled.MenuList>
        {menuItems.map((item) => {
          const isExpanded = isItemExpanded(item.id);
          const isActive = isItemActive(item.id) || hasActiveChild(item.children);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <Styled.MenuItemWrapper key={item.id}>
              <Styled.MenuItem
                $isActive={isActive}
                onClick={() => {
                  if (hasChildren) {
                    handleToggleExpand(item.id);
                  } else {
                    handleItemClick(item.id, item.path);
                  }
                }}
              >
                <Styled.MenuIcon>{item.icon}</Styled.MenuIcon>
                <Styled.MenuLabel>{item.label}</Styled.MenuLabel>
                {item.badge && typeof item.badge === 'number' && (
                  <Styled.Badge>{item.badge}</Styled.Badge>
                )}
                {hasChildren && (
                  <Styled.ExpandArrow $isExpanded={isExpanded}>▼</Styled.ExpandArrow>
                )}
              </Styled.MenuItem>
              {hasChildren && isExpanded && (
                <Styled.SubMenuList>
                  {item.children!.map((child) => (
                    <Styled.SubMenuItem
                      key={child.id}
                      $isActive={isItemActive(child.id)}
                      onClick={() => handleItemClick(child.id, child.path)}
                    >
                      <Styled.MenuLabel>{child.label}</Styled.MenuLabel>
                      {child.badge && typeof child.badge === 'string' && (
                        <Styled.NewBadge>{child.badge}</Styled.NewBadge>
                      )}
                    </Styled.SubMenuItem>
                  ))}
                </Styled.SubMenuList>
              )}
            </Styled.MenuItemWrapper>
          );
        })}
      </Styled.MenuList>

      <Styled.UserDropdownContainer ref={userDropdownRef}>
        <Styled.Footer onClick={handleToggleUserDropdown}>
          <Styled.UserIcon>👤</Styled.UserIcon>
          <Styled.UserName>{userName}</Styled.UserName>
          <Styled.DropdownArrow $isOpen={isUserDropdownOpen}>▼</Styled.DropdownArrow>
        </Styled.Footer>
        <Styled.UserDropdownMenu $isOpen={isUserDropdownOpen}>
          <Styled.UserDropdownItem onClick={handleLogout}>
            <Styled.LogoutIcon>🚪</Styled.LogoutIcon>
            <span>Выйти</span>
          </Styled.UserDropdownItem>
        </Styled.UserDropdownMenu>
      </Styled.UserDropdownContainer>
    </Styled.SidebarContainer>
  );
};

