import styled from 'styled-components'
import { MdArrowBack } from 'react-icons/md'

export const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: '#f8f9fa',
})

export const Header = styled.header({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e9ecef',
  color: '#212529',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
})

export const BackIcon = styled(MdArrowBack)({
  fontSize: '24px',
  color: '#495057',
})

export const HeaderTitle = styled.h1({
  fontSize: '20px',
  fontWeight: 600,
  margin: 0,
  color: '#212529',
})

export const HeaderRight = styled.div({
  width: '32px',
})

export const MainContent = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
})

export const RoomSelector = styled.div({
  padding: '16px 20px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e9ecef',
})

export const RoomSelect = styled.select({
  width: '100%',
  padding: '12px 16px',
  fontSize: '16px',
  border: '1px solid #ced4da',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  color: '#495057',
  cursor: 'pointer',
  outline: 'none',
  '&:focus': {
    borderColor: '#228be6',
    boxShadow: '0 0 0 3px rgba(34, 139, 230, 0.1)',
  },
})

export const HallMapContainer = styled.div({
  flex: 1,
  position: 'relative',
  overflow: 'auto',
  backgroundColor: '#ffffff',
})

export const HallMap = styled.div<{ $minWidth?: number; $minHeight?: number }>((props) => ({
  position: 'relative',
  width: '100%',
  minWidth: props.$minWidth || 800,
  minHeight: props.$minHeight || 600,
}))

export const TableShape = styled.div<{
  $x: number
  $y: number
  $width: number
  $height: number
  $shape: 'round' | 'square'
  $status: 'available' | 'occupied' | 'reserved'
  $selected: boolean
}>((props) => {
  const canInteract = props.$status !== 'occupied'

  return {
    position: 'absolute',
    left: `${props.$x}px`,
    top: `${props.$y}px`,
    width: `${props.$width}px`,
    height: `${props.$height}px`,
    backgroundColor:
      props.$status === 'occupied'
        ? '#ff6b6b'
        : props.$status === 'reserved'
          ? '#ffd43b'
          : props.$selected
            ? '#228be6'
            : '#e7f5ff',
    border: `2px solid ${
      props.$status === 'occupied'
        ? '#fa5252'
        : props.$status === 'reserved'
          ? '#fab005'
          : props.$selected
            ? '#1c7ed6'
            : '#339af0'
    }`,
    color: props.$status === 'available' && !props.$selected ? '#1c7ed6' : '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: canInteract ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s ease',
    borderRadius: props.$shape === 'round' ? '50%' : '8px',
    fontWeight: 600,
    fontSize: '14px',
    userSelect: 'none',
    ...canInteract && {
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    },
  }
})

export const TableNumber = styled.span({
  fontSize: '16px',
  fontWeight: 700,
})

export const TableCapacity = styled.span({
  fontSize: '11px',
  opacity: 0.8,
  marginTop: '2px',
})

export const LoadingContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#868e96',
  fontSize: '16px',
})

export const EmptyState = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#868e96',
  textAlign: 'center',
  padding: '40px 20px',
})

export const EmptyStateIcon = styled.div({
  fontSize: '48px',
  marginBottom: '16px',
})

export const EmptyStateText = styled.p({
  fontSize: '16px',
  margin: 0,
})

export const LoadingOverlay = styled.div({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(255,255,255,0.95)',
  padding: '20px 40px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  zIndex: 100,
  color: '#228be6',
  fontWeight: 500,
})

export const GuestsDropdownWrapper = styled.div<{ $placement: 'top' | 'bottom' }>((props) => ({
  position: 'absolute',
  zIndex: 50,
  minWidth: '200px',
}))

export const DropdownTriangle = styled.div<{ $placement: 'top' | 'bottom' }>((props) => ({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 0,
  height: 0,
  borderLeft: '8px solid transparent',
  borderRight: '8px solid transparent',
  ...(props.$placement === 'top'
    ? {
        bottom: '-8px',
        borderTop: '8px solid #ffffff',
      }
    : {
        top: '-8px',
        borderBottom: '8px solid #343a40',
      }),
}))

export const DropdownHeader = styled.div<{ $placement: 'top' | 'bottom' }>((props) => ({
  backgroundColor: '#343a40',
  color: '#ffffff',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 500,
  textAlign: 'center',
  ...(props.$placement === 'top'
    ? {
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
      }
    : {
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
      }),
}))

export const DropdownList = styled.div<{ $placement: 'top' | 'bottom' }>((props) => ({
  backgroundColor: '#ffffff',
  maxHeight: '280px',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: '#adb5bd #f8f9fa',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f8f9fa',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#adb5bd',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#868e96',
  },
  ...(props.$placement === 'top'
    ? {
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        borderTop: 'none',
      }
    : {
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        borderTop: 'none',
      }),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
}))

export const DropdownItem = styled.div<{ $selected: boolean }>((props) => ({
  padding: '14px 20px',
  fontSize: '18px',
  fontWeight: 500,
  textAlign: 'center',
  color: props.$selected ? '#228be6' : '#495057',
  cursor: 'pointer',
  borderBottom: '1px solid #f1f3f5',
  transition: 'background-color 0.15s ease',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
  '&:active': {
    backgroundColor: '#e9ecef',
  },
}))

