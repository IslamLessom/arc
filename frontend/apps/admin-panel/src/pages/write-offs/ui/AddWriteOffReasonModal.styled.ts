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
  maxWidth: '600px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
})

export const ModalHeader = styled.div({
  padding: '16px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #e2e8f0',
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
  color: '#64748b',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
})

export const ModalTitle = styled.h2({
  margin: 0,
  fontSize: '18px',
  fontWeight: 500,
  color: '#1e293b',
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
  color: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

export const ModalRequired = styled.span({
  color: '#ef4444',
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

export const PnlBlockSelector = styled.div({
  display: 'flex',
  gap: '0',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  overflow: 'hidden',
  width: 'fit-content',
})

export const PnlBlockOption = styled.button<{ $active?: boolean }>((props) => ({
  padding: '10px 24px',
  border: 'none',
  backgroundColor: props.$active ? '#dbeafe' : '#ffffff',
  color: props.$active ? '#1e40af' : '#1e40af',
  fontSize: '14px',
  fontWeight: props.$active ? '600' : '400',
  cursor: props.$disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s ease',
  borderRight: '1px solid #3b82f6',
  '&:last-child': {
    borderRight: 'none',
  },
  '&:hover': {
    backgroundColor: props.$disabled ? (props.$active ? '#dbeafe' : '#ffffff') : '#e0f2fe',
  },
  '&:disabled': {
    opacity: 0.6,
  },
}))

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
  marginBottom: '16px',
})

