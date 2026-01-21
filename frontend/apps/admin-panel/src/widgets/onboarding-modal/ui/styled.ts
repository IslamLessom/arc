import styled from 'styled-components'

export const Overlay = styled.div<{ $isOpen: boolean }>((props) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: props.$isOpen ? 'flex' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
}))

export const ModalContainer = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
})

export const ModalHeader = styled.div({
  padding: '24px 24px 16px',
  borderBottom: '1px solid #f0f0f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

export const ModalTitle = styled.h2({
  margin: 0,
  fontSize: '24px',
  fontWeight: 600,
  color: '#333333',
})

export const CloseButton = styled.button({
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666666',
  padding: '0',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
})

export const ModalBody = styled.div({
  padding: '24px',
})

export const ModalDescription = styled.p({
  margin: '0 0 24px',
  fontSize: '14px',
  color: '#666666',
  lineHeight: '1.5',
})

