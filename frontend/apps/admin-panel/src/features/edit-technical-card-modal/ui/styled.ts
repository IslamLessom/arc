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

export const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
})

export const FormSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

export const InputGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const Label = styled.label({
  fontSize: '14px',
  fontWeight: 500,
  color: '#333333',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
})

export const Required = styled.span({
  color: '#ff4d4f',
})

export const Select = styled.select({
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#333333',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },
  '&:hover': {
    borderColor: '#40a9ff',
  },
})

export const InputWrapper = styled.div({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
})

export const UnitLabel = styled.span({
  padding: '10px 12px',
  fontSize: '14px',
  backgroundColor: '#f5f5f5',
  borderRadius: '6px',
  color: '#666666',
  minWidth: '40px',
  textAlign: 'center',
})

export const ButtonGroup = styled.div({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #f0f0f0',
})

export const ErrorMessage = styled.div({
  padding: '12px',
  backgroundColor: '#fff2f0',
  border: '1px solid #ffccc7',
  borderRadius: '6px',
  color: '#ff4d4f',
  fontSize: '14px',
})

export const LoadingContainer = styled.div({
  padding: '40px',
  textAlign: 'center',
  fontSize: '16px',
  color: '#666666',
})
