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
  maxWidth: '560px',
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

export const TypeButtons = styled.div({
  display: 'flex',
  gap: '12px',
})

export const TypeButton = styled.button<{ $active: boolean; $variant: 'income' | 'expense' | 'transfer' }>((props) => ({
  flex: 1,
  padding: '12px 16px',
  border: `2px solid ${props.$active ? getColor(props.$variant) : '#e2e8f0'}`,
  borderRadius: '8px',
  backgroundColor: props.$active ? getBgColor(props.$variant) : '#ffffff',
  color: props.$active ? '#ffffff' : '#64748b',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    borderColor: getColor(props.$variant),
    backgroundColor: props.$active ? getBgColor(props.$variant) : getHoverBgColor(props.$variant),
  },
}))

export const AmountInput = styled.input({
  padding: '14px 16px',
  fontSize: '20px',
  fontWeight: 600,
  border: '1px solid #d9d9d9',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  color: '#333333',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },
  '&::placeholder': {
    color: '#bfbfbf',
    fontWeight: 400,
  },
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
  '&:disabled': {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    color: '#999999',
  },
})

export const DateTimeGroup = styled.div({
  display: 'flex',
  gap: '12px',
})

export const DateInput = styled.input({
  flex: 2,
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#333333',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },
})

export const TimeInput = styled.input({
  flex: 1,
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#333333',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },
})

export const TextInput = styled.input({
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#333333',
  transition: 'border-color 0.2s',
  resize: 'vertical',
  minHeight: '80px',
  fontFamily: 'inherit',
  '&:focus': {
    outline: 'none',
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },
  '&::placeholder': {
    color: '#bfbfbf',
  },
})

export const ButtonGroup = styled.div({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #f0f0f0',
})

export const CancelButton = styled.button({
  padding: '10px 20px',
  border: '1px solid #d9d9d9',
  backgroundColor: '#ffffff',
  color: '#333333',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#40a9ff',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})

export const SubmitButton = styled.button({
  padding: '10px 20px',
  border: 'none',
  backgroundColor: '#1890ff',
  color: '#ffffff',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#40a9ff',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})

export const ErrorMessage = styled.div({
  padding: '12px',
  backgroundColor: '#fff2f0',
  border: '1px solid #ffccc7',
  borderRadius: '6px',
  color: '#ff4d4f',
  fontSize: '14px',
})

export const AccountsGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

function getColor(variant: 'income' | 'expense' | 'transfer'): string {
  switch (variant) {
    case 'income':
      return '#52c41a'
    case 'expense':
      return '#ff4d4f'
    case 'transfer':
      return '#1890ff'
  }
}

function getBgColor(variant: 'income' | 'expense' | 'transfer'): string {
  return getColor(variant)
}

function getHoverBgColor(variant: 'income' | 'expense' | 'transfer'): string {
  switch (variant) {
    case 'income':
      return '#f6ffed'
    case 'expense':
      return '#fff1f0'
    case 'transfer':
      return '#e6f7ff'
  }
}
