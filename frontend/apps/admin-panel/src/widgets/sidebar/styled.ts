import styled from 'styled-components';

export const SidebarContainer = styled.aside(({ theme }) => ({
  width: '280px',
  height: '100vh',
  backgroundColor: theme.colors.background,
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
  overflowY: 'auto',
  borderRight: `1px solid ${theme.colors.border}`,
}));

export const Header = styled.div(({ theme }) => ({
  padding: '20px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  borderBottom: `1px solid ${theme.colors.border}`,
}));

export const LogoContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

export const LogoIcon = styled.div(({ theme }) => ({
  width: '36px',
  height: '36px',
  backgroundColor: theme.colors.accent,
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.colors.white,
  fontSize: '18px',
  fontWeight: 700,
  boxShadow: `0 4px 12px ${theme.colors.accent}40`,
}));

export const LogoText = styled.span(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 700,
  color: theme.colors.textPrimary,
  letterSpacing: '-0.3px',
}));

export const BackButton = styled.button(({ theme }) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.colors.textSecondary,
  fontSize: '16px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.colors.backgroundHover,
    color: theme.colors.textPrimary,
  },
}));

export const MenuList = styled.nav({
  flex: 1,
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const MenuSection = styled.div({
  marginBottom: '8px',
});

export const MenuSectionTitle = styled.span(({ theme }) => ({
  fontSize: '11px',
  fontWeight: 600,
  color: theme.colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: '8px 12px 4px',
}));

export const MenuItemWrapper = styled.div({
  width: '100%',
  borderRadius: '10px',
  overflow: 'hidden',
});

export const MenuItem = styled.button<{ $isActive: boolean }>(({ theme, ...props }) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  background: props.$isActive ? theme.colors.accentBackground : 'transparent',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  textAlign: 'left',
  color: props.$isActive ? theme.colors.accentLight : theme.colors.textSecondary,
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    backgroundColor: props.$isActive
      ? theme.colors.accentBackground
      : theme.colors.backgroundHover,
    color: props.$isActive ? theme.colors.accentLight : theme.colors.textPrimary,
    transform: 'translateX(2px)',
  },
}));

export const MenuIconWrapper = styled.div({
  width: '22px',
  height: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  fontSize: '18px',
});

export const MenuLabel = styled.span({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const Badge = styled.span(({ theme }) => ({
  backgroundColor: theme.colors.accent,
  color: theme.colors.white,
  borderRadius: '20px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 600,
  flexShrink: 0,
}));

export const ExpandArrow = styled.span<{ $isExpanded: boolean }>(({ theme, ...props }) => ({
  color: theme.colors.textMuted,
  fontSize: '12px',
  transition: 'transform 0.25s ease',
  transform: props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  flexShrink: 0,
}));

export const SubMenuList = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '4px',
  marginLeft: '24px',
  borderRadius: '8px',
  padding: '6px 4px',
  gap: '2px',
}));

export const SubMenuItem = styled.button<{ $isActive: boolean }>(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  background: props.$isActive ? theme.colors.accentBackground : 'transparent',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'left',
  color: props.$isActive ? theme.colors.accentLight : theme.colors.textSecondary,
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: props.$isActive
      ? theme.colors.accentBackground
      : theme.colors.backgroundHover,
    color: props.$isActive ? theme.colors.accentLight : theme.colors.textPrimary,
  },
}));

export const SubMenuDot = styled.span<{ $isActive: boolean }>(({ theme, ...props }) => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: props.$isActive ? theme.colors.accent : theme.colors.textMuted,
  flexShrink: 0,
  transition: 'background-color 0.2s ease',
}));

export const NewBadge = styled.span(({ theme }) => ({
  backgroundColor: theme.colors.accent,
  color: theme.colors.white,
  borderRadius: '12px',
  padding: '2px 8px',
  fontSize: '10px',
  fontWeight: 600,
  flexShrink: 0,
}));

export const Footer = styled.div(({ theme }) => ({
  padding: '16px',
  borderTop: `1px solid ${theme.colors.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.colors.backgroundHover,
  },
}));

export const UserAvatar = styled.div(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: theme.colors.accent,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.colors.white,
  fontSize: '16px',
  fontWeight: 600,
  flexShrink: 0,
  boxShadow: `0 4px 8px ${theme.colors.shadow}20`,
}));

export const UserInfo = styled.div({
  flex: 1,
  minWidth: 0,
});

export const UserName = styled.span(({ theme }) => ({
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: theme.colors.textPrimary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const UserRole = styled.span(({ theme }) => ({
  display: 'block',
  fontSize: '12px',
  color: theme.colors.textMuted,
  marginTop: '2px',
}));

export const DropdownArrow = styled.span<{ $isOpen: boolean }>(({ theme, ...props }) => ({
  color: theme.colors.textMuted,
  fontSize: '14px',
  transition: 'transform 0.25s ease',
  transform: props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  flexShrink: 0,
}));

export const UserDropdownContainer = styled.div({
  position: 'relative',
  width: '100%',
});

export const UserDropdownMenu = styled.div<{ $isOpen: boolean }>(({ theme, ...props }) => ({
  position: 'absolute',
  bottom: '100%',
  left: '12px',
  right: '12px',
  marginBottom: '8px',
  backgroundColor: theme.colors.backgroundHover,
  borderRadius: '12px',
  boxShadow: `0 8px 24px ${theme.colors.shadow}`,
  border: `1px solid ${theme.colors.border}`,
  overflow: 'hidden',
  display: props.$isOpen ? 'flex' : 'none',
  flexDirection: 'column',
  zIndex: 1000,
}));

export const UserDropdownItem = styled.button(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  color: theme.colors.textSecondary,
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  width: '100%',
  '&:hover': {
    backgroundColor: theme.colors.backgroundActive,
    color: theme.colors.textPrimary,
  },
  '&:first-child': {
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  '&:last-child': {
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
  },
}));

export const DropdownIcon = styled.span({
  fontSize: '16px',
  width: '20px',
  textAlign: 'center',
});

export const Divider = styled.div(({ theme }) => ({
  height: '1px',
  backgroundColor: theme.colors.border,
  margin: '8px 16px',
}));

export const LogoutItem = styled(UserDropdownItem)(({ theme }) => ({
  color: theme.colors.danger,
  '&:hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: theme.colors.danger,
  },
}));
