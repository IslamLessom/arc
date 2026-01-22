import styled from 'styled-components';

export const SidebarContainer = styled.aside({
  width: '280px',
  height: '100vh',
  backgroundColor: '#f5f5f5',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
  overflowY: 'auto',
});

export const Header = styled.div({
  backgroundColor: '#1890ff',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
});

export const BackButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '18px',
  '&:hover': {
    opacity: 0.8,
  },
});

export const PosterButton = styled.button({
  background: 'linear-gradient(135deg, #8b7355 0%, #6b5d4f 100%)',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  flex: 1,
  textAlign: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    opacity: 0.9,
  },
});

export const LampIcon = styled.div({
  width: '24px',
  height: '24px',
  backgroundColor: '#87ceeb',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
});

export const MenuList = styled.nav({
  flex: 1,
  padding: '16px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const MenuItemWrapper = styled.div({
  width: '100%',
});

export const MenuItem = styled.button<{ $isActive: boolean }>((props) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  background: props.$isActive ? '#e6f7ff' : 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  color: props.$isActive ? '#1890ff' : '#333333',
  fontSize: '14px',
  transition: 'background-color 0.2s',
  position: 'relative',
  '&:hover': {
    backgroundColor: props.$isActive ? '#e6f7ff' : '#f0f0f0',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    backgroundColor: props.$isActive ? '#1890ff' : 'transparent',
  },
}));

export const MenuIcon = styled.div({
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const MenuLabel = styled.span({
  flex: 1,
});

export const Badge = styled.span({
  backgroundColor: '#ff4d4f',
  color: '#ffffff',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 600,
  flexShrink: 0,
});

export const Footer = styled.div({
  padding: '16px',
  borderTop: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
});

export const UserIcon = styled.div({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#d9d9d9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const UserName = styled.span({
  flex: 1,
  fontSize: '14px',
  color: '#333333',
  fontWeight: 500,
});

export const DropdownArrow = styled.span<{ $isOpen: boolean }>((props) => ({
  color: '#999999',
  fontSize: '12px',
  transition: 'transform 0.2s',
  transform: props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  flexShrink: 0,
}));

export const ExpandArrow = styled.span<{ $isExpanded: boolean }>((props) => ({
  color: '#999999',
  fontSize: '12px',
  transition: 'transform 0.2s',
  transform: props.$isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  flexShrink: 0,
}));

export const SubMenuList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#ffffff',
  overflow: 'hidden',
});

export const SubMenuItem = styled.button<{ $isActive: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 16px 10px 48px',
  background: props.$isActive ? '#e6f7ff' : 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  color: props.$isActive ? '#1890ff' : '#333333',
  fontSize: '14px',
  transition: 'background-color 0.2s',
  position: 'relative',
  '&:hover': {
    backgroundColor: props.$isActive ? '#e6f7ff' : '#f0f0f0',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
    backgroundColor: props.$isActive ? '#1890ff' : 'transparent',
  },
}));

export const NewBadge = styled.span({
  backgroundColor: '#1890ff',
  color: '#ffffff',
  borderRadius: '12px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 600,
  flexShrink: 0,
});

export const UserDropdownContainer = styled.div({
  position: 'relative',
  width: '100%',
});

export const UserDropdownMenu = styled.div<{ $isOpen: boolean }>((props) => ({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
  marginBottom: '8px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden',
  display: props.$isOpen ? 'flex' : 'none',
  flexDirection: 'column',
  zIndex: 1000,
}));

export const UserDropdownItem = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  color: '#333333',
  fontSize: '14px',
  transition: 'background-color 0.2s',
  width: '100%',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
  '&:first-child': {
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  '&:last-child': {
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
  },
});

export const LogoutIcon = styled.span({
  fontSize: '16px',
});

