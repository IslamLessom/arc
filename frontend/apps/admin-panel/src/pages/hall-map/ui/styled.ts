import styled from 'styled-components'

export const PageContainer = styled.div({
  padding: '24px',
  backgroundColor: '#ffffff',
  minHeight: '100vh',
})

export const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
})

export const Title = styled.h1({
  margin: 0,
  fontSize: '24px',
  fontWeight: '600',
  color: '#1e293b',
})

export const HeaderControls = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const HallSelect = styled.select({
  padding: '8px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  minWidth: '200px',
})

export const RoomSelect = styled.select({
  padding: '8px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  minWidth: '150px',
})

export const SelectorsGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const EditButton = styled.button({
  padding: '8px 16px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#64748b',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
})

export const AddTableButton = styled.button({
  padding: '10px 20px',
  border: 'none',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#2563eb',
  },
})

export const CanvasContainer = styled.div({
  position: 'relative',
  width: '100%',
  height: '600px',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  backgroundColor: '#f8fafc',
  overflow: 'hidden',
  backgroundImage: `
    linear-gradient(#e2e8f0 1px, transparent 1px),
    linear-gradient(90deg, #e2e8f0 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px',
})

export const TableWrapper = styled.div<{
  $x: number
  $y: number
  $rotation: number
}>((props) => ({
  position: 'absolute',
  left: `${props.$x}px`,
  top: `${props.$y}px`,
  transform: `rotate(${props.$rotation}deg)`,
  transformOrigin: 'center center',
}))

export const TableElement = styled.div<{
  $width: number
  $height: number
  $shape: 'round' | 'square'
  $status: 'available' | 'occupied' | 'reserved'
}>((props) => ({
  position: 'relative',
  width: `${props.$width}px`,
  height: `${props.$height}px`,
  borderRadius: props.$shape === 'round' ? '50%' : '8px',
  backgroundColor:
    props.$status === 'occupied'
      ? '#ef4444'
      : props.$status === 'reserved'
      ? '#f59e0b'
      : '#64748b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  cursor: 'move',
  border: '2px solid #ffffff',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  userSelect: 'none',
  transition: 'border-radius 0.2s ease',

  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    [`${ResizeHandle}`]: {
      opacity: 1,
    },
  },
}))

export const TableDeleteButton = styled.button({
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: '#ef4444',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  zIndex: 10,
  transition: 'all 0.2s ease',
  lineHeight: 1,

  '&:hover': {
    backgroundColor: '#dc2626',
    transform: 'scale(1.1)',
  },
})

export const ResizeHandle = styled.div<{
  $position: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
}>((props) => {
  const size = 8
  const offset = -size / 2
  const positions: Record<string, { top?: string; bottom?: string; left?: string; right?: string; cursor: string }> = {
    n: { top: `${offset}px`, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
    s: { bottom: `${offset}px`, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
    e: { right: `${offset}px`, top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' },
    w: { left: `${offset}px`, top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' },
    ne: { top: `${offset}px`, right: `${offset}px`, cursor: 'ne-resize' },
    nw: { top: `${offset}px`, left: `${offset}px`, cursor: 'nw-resize' },
    se: { bottom: `${offset}px`, right: `${offset}px`, cursor: 'se-resize' },
    sw: { bottom: `${offset}px`, left: `${offset}px`, cursor: 'sw-resize' },
  }

  return {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: '#3b82f6',
    border: '2px solid #ffffff',
    borderRadius: '50%',
    zIndex: 5,
    ...positions[props.$position],
    opacity: 0,
    transition: 'opacity 0.2s ease',
    pointerEvents: 'auto',
  }
})


export const BottomActions = styled.div({
  position: 'fixed',
  bottom: '24px',
  left: '304px',
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
})

export const SaveButton = styled.button({
  padding: '12px 24px',
  border: 'none',
  backgroundColor: '#10b981',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',

  '&:hover': {
    backgroundColor: '#059669',
  },
})

export const ModalOverlay = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
})

export const Modal = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  width: '400px',
  maxWidth: '90vw',
})

export const ModalTitle = styled.h2({
  margin: '0 0 20px 0',
  fontSize: '20px',
  fontWeight: '600',
  color: '#1e293b',
})

export const ModalForm = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

export const FormGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const FormLabel = styled.label({
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569',
})

export const FormInput = styled.input({
  padding: '8px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  backgroundColor: '#ffffff',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
  },
})

export const FormSelect = styled.select({
  padding: '8px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  backgroundColor: '#ffffff',
  cursor: 'pointer',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
  },
})

export const ModalActions = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '8px',
})

export const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>((props) => ({
  padding: '10px 20px',
  border: props.$variant === 'primary' ? 'none' : '1px solid #e2e8f0',
  backgroundColor: props.$variant === 'primary' ? '#3b82f6' : '#ffffff',
  color: props.$variant === 'primary' ? '#ffffff' : '#64748b',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: props.$variant === 'primary' ? '#2563eb' : '#f8fafc',
  },
}))

