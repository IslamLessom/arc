import styled from 'styled-components';
import { colors } from '@restaurant-pos/ui';

export const SidebarContainer = styled.aside({
  width: '280px',
  height: '100vh',
  backgroundColor: colors.background,
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
  overflowY: 'auto',
  borderRight: `1px solid ${colors.border}`,
});

export const Header = styled.div({
  padding: '20px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  borderBottom: `1px solid ${colors.border}`,
});

export const LogoContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

export const LogoIcon = styled.div({
  width: '36px',
  height: '36px',
  backgroundColor: colors.accent,
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.white,
  fontSize: '18px',
  fontWeight: 700,
  boxShadow: `0 4px 12px ${colors.accent}40`,
});

export const LogoText = styled.span({
  fontSize: '18px',
  fontWeight: 700,
  color: colors.textPrimary,
  letterSpacing: '-0.3px',
});

export const BackButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.textSecondary,
  fontSize: '16px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.backgroundHover,
    color: colors.textPrimary,
  },
});

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

export const MenuSectionTitle = styled.span({
  fontSize: '11px',
  fontWeight: 600,
  color: colors.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: '8px 12px 4px',
});

export const MenuItemWrapper = styled.div({
  width: '100%',
  borderRadius: '10px',
  overflow: 'hidden',
});

export const MenuItem = styled.button<{ $isActive: boolean }>((props) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  background: props.$isActive ? colors.accentBackground : 'transparent',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  textAlign: 'left',
  color: props.$isActive ? colors.accentLight : colors.textSecondary,
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    backgroundColor: props.$isActive ? colors.accentBackground : colors.backgroundHover,
    color: props.$isActive ? colors.accentLight : colors.textPrimary,
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

export const Badge = styled.span({
  backgroundColor: colors.accent,
  color: colors.white,
  borderRadius: '20px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 600,
  flexShrink: 0,
});

export const ExpandArrow = styled.span<{ $isExpanded: boolean }>((props) => ({
  color: colors.textMuted,
  fontSize: '12px',
  transition: 'transform 0.25s ease',
  transform: props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  flexShrink: 0,
}));

export const SubMenuList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(0, 0, 0, 0.15)',
  marginTop: '4px',
  marginLeft: '24px',
  borderRadius: '8px',
  padding: '6px 4px',
  gap: '2px',
});

export const SubMenuItem = styled.button<{ $isActive: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  background: props.$isActive ? colors.accentBackground : 'transparent',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'left',
  color: props.$isActive ? colors.accentLight : colors.textSecondary,
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: props.$isActive ? colors.accentBackground : colors.backgroundHover,
    color: props.$isActive ? colors.accentLight : colors.textPrimary,
  },
}));

export const SubMenuDot = styled.span<{ $isActive: boolean }>((props) => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: props.$isActive ? colors.accent : colors.textMuted,
  flexShrink: 0,
  transition: 'background-color 0.2s ease',
}));

export const NewBadge = styled.span({
  backgroundColor: colors.accent,
  color: colors.white,
  borderRadius: '12px',
  padding: '2px 8px',
  fontSize: '10px',
  fontWeight: 600,
  flexShrink: 0,
});

export const Footer = styled.div({
  padding: '16px',
  borderTop: `1px solid ${colors.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: colors.backgroundHover,
  },
});

export const UserAvatar = styled.div({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: colors.accent,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.white,
  fontSize: '16px',
  fontWeight: 600,
  flexShrink: 0,
  boxShadow: `0 4px 8px ${colors.shadow}20`,
});

export const UserInfo = styled.div({
  flex: 1,
  minWidth: 0,
});

export const UserName = styled.span({
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: colors.textPrimary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const UserRole = styled.span({
  display: 'block',
  fontSize: '12px',
  color: colors.textMuted,
  marginTop: '2px',
});

export const DropdownArrow = styled.span<{ $isOpen: boolean }>((props) => ({
  color: colors.textMuted,
  fontSize: '14px',
  transition: 'transform 0.25s ease',
  transform: props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  flexShrink: 0,
}));

export const UserDropdownContainer = styled.div({
  position: 'relative',
  width: '100%',
});

export const UserDropdownMenu = styled.div<{ $isOpen: boolean }>((props) => ({
  position: 'absolute',
  bottom: '100%',
  left: '12px',
  right: '12px',
  marginBottom: '8px',
  backgroundColor: colors.backgroundHover,
  borderRadius: '12px',
  boxShadow: `0 8px 24px ${colors.shadow}`,
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
  display: props.$isOpen ? 'flex' : 'none',
  flexDirection: 'column',
  zIndex: 1000,
}));

export const UserDropdownItem = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  color: colors.textSecondary,
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  width: '100%',
  '&:hover': {
    backgroundColor: colors.backgroundActive,
    color: colors.textPrimary,
  },
  '&:first-child': {
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  '&:last-child': {
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
  },
});

export const DropdownIcon = styled.span({
  fontSize: '16px',
  width: '20px',
  textAlign: 'center',
});

export const Divider = styled.div({
  height: '1px',
  backgroundColor: colors.border,
  margin: '8px 16px',
});

export const LogoutItem = styled(UserDropdownItem)({
  color: colors.danger,
  '&:hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: colors.danger,
  },
});
