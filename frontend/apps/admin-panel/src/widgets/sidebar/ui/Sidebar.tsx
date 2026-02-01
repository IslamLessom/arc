import { useSidebar } from '../hooks/useSidebar';
import type { SidebarProps } from '../model/types';
import { MenuItemId } from '../model/enums';
import { menuItems } from '../lib/constants';
import * as Styled from '../styled';

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

  const { userName = 'Admin', userRole = 'Administrator' } = props;

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Styled.SidebarContainer>
      <Styled.Header>
        <Styled.LogoContainer>
          <Styled.LogoIcon>P</Styled.LogoIcon>
          <Styled.LogoText>ARCE</Styled.LogoText>
        </Styled.LogoContainer>
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
                <Styled.MenuIconWrapper>{item.icon}</Styled.MenuIconWrapper>
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
                      <Styled.SubMenuDot $isActive={isItemActive(child.id)} />
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
          <Styled.UserAvatar>{getUserInitials(userName)}</Styled.UserAvatar>
          <Styled.UserInfo>
            <Styled.UserName>{userName}</Styled.UserName>
            <Styled.UserRole>{userRole}</Styled.UserRole>
          </Styled.UserInfo>
          <Styled.DropdownArrow $isOpen={isUserDropdownOpen}>▼</Styled.DropdownArrow>
        </Styled.Footer>
        <Styled.UserDropdownMenu $isOpen={isUserDropdownOpen}>
          <Styled.UserDropdownItem>
            <Styled.DropdownIcon>👤</Styled.DropdownIcon>
            <span>Профиль</span>
          </Styled.UserDropdownItem>
          <Styled.UserDropdownItem>
            <Styled.DropdownIcon>⚙️</Styled.DropdownIcon>
            <span>Настройки</span>
          </Styled.UserDropdownItem>
          <Styled.Divider />
          <Styled.LogoutItem onClick={handleLogout}>
            <Styled.DropdownIcon>🚪</Styled.DropdownIcon>
            <span>Выйти</span>
          </Styled.LogoutItem>
        </Styled.UserDropdownMenu>
      </Styled.UserDropdownContainer>
    </Styled.SidebarContainer>
  );
};
