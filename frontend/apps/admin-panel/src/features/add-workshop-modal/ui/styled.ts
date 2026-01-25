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
  padding: '16px 24px',
  backgroundColor: '#3b82f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

export const ModalHeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const ModalBackButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px',
  color: '#93c5fd',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
  },
})

export const ModalTitle = styled.h2({
  margin: 0,
  fontSize: '18px',
  fontWeight: 500,
  color: '#ffffff',
})

export const ModalBody = styled.div({
  padding: '24px',
})

export const ModalForm = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
})

export const ModalInputGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
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

export const ModalInput = styled.input({
  padding: '10px 16px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  backgroundColor: '#ffffff',
  transition: 'all 0.2s ease',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  '&::placeholder': {
    color: '#94a3b8',
  },
  '&:disabled': {
    backgroundColor: '#f8fafc',
    cursor: 'not-allowed',
  },
})

export const ModalCheckboxGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const ModalCheckbox = styled.input({
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  accentColor: '#3b82f6',
})

export const ModalCheckboxLabel = styled.label({
  fontSize: '14px',
  color: '#333333',
  cursor: 'pointer',
  userSelect: 'none',
})

export const ModalButtonGroup = styled.div({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-start',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #f0f0f0',
})

export const ModalSubmitButton = styled.button<{ $disabled?: boolean }>((props) => ({
  padding: '10px 24px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: props.$disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: props.$disabled ? '#94a3b8' : '#10b981',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: props.$disabled ? '#94a3b8' : '#059669',
  },
}))

export const ModalErrorMessage = styled.div({
  padding: '12px',
  backgroundColor: '#fff2f0',
  border: '1px solid #ffccc7',
  borderRadius: '6px',
  color: '#ff4d4f',
  fontSize: '14px',
})

