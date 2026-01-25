import styled from 'styled-components'

export const ModalOverlay = styled.div<{ $isOpen: boolean }>((props) => ({
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
  maxWidth: '500px',
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

export const ModalHeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
})

export const ModalBackButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  color: '#3b82f6',
  fontSize: '1.5rem',
  '&:hover': {
    color: '#2563eb',
  },
})

export const ModalTitle = styled.h2({
  margin: 0,
  fontSize: '24px',
  fontWeight: 600,
  color: '#333333',
})

export const ModalCloseButton = styled.button({
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

export const ModalForm = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
})

export const ModalInputGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const ModalLabel = styled.label({
  fontSize: '14px',
  fontWeight: 500,
  color: '#333333',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

export const ModalRequired = styled.span({
  color: '#ff4d4f',
})

export const ModalButtonGroup = styled.div({
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #f0f0f0',
})

export const ModalErrorMessage = styled.div({
  padding: '12px',
  backgroundColor: '#fff2f0',
  border: '1px solid #ffccc7',
  borderRadius: '6px',
  color: '#ff4d4f',
  fontSize: '14px',
})