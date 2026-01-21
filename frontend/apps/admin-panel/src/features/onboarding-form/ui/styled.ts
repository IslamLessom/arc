import styled from 'styled-components'

export const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
})

export const FormRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
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
})

export const Input = styled.input({
  padding: '12px 16px',
  fontSize: '14px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  outline: 'none',
  transition: 'border-color 0.2s',
  '&:focus': {
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },
  '&:disabled': {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
  },
})

export const Select = styled.select({
  padding: '12px 16px',
  fontSize: '14px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  '&:focus': {
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },
  '&:disabled': {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
  },
})

export const CheckboxGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const Checkbox = styled.input({
  width: '18px',
  height: '18px',
  cursor: 'pointer',
  '&:disabled': {
    cursor: 'not-allowed',
  },
})

export const CheckboxLabel = styled.label({
  fontSize: '14px',
  color: '#333333',
  cursor: 'pointer',
  userSelect: 'none',
})

export const ErrorMessage = styled.div({
  color: '#ff4d4f',
  fontSize: '14px',
  padding: '8px 0',
})

export const ButtonGroup = styled.div({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '8px',
})

