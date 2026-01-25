import styled from 'styled-components'

export const Form = styled.form({
  width: '100%',
})

export const FormSection = styled.div({
  marginBottom: '24px',
})

export const InputGroup = styled.div({
  marginBottom: '16px',
})

export const Label = styled.label({
  display: 'block',
  marginBottom: '6px',
  fontWeight: 500,
  color: '#333',
})

export const AdditionalLabel = styled.label({
  display: 'block',
  marginBottom: '6px',
  fontWeight: 500,
  color: '#333',
  fontSize: '0.67em', /* Уменьшено в 1.5 раза (14px * 2/3 ≈ 9.33px) */
})

export const AdditionalFieldsContainer = styled.div({
  height: '200px',
  overflow: 'auto',
  padding: '8px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  backgroundColor: '#fafafa',
})

export const Required = styled.span({
  color: '#ff4d4f',
})

export const Select = styled.select({
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  fontSize: '14px',
  background: 'white',

  '&:focus': {
    outline: 'none',
    borderColor: '#1890ff',
    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
  },

  '&:disabled': {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
  },
})

export const ToggleLink = styled.button({
  background: 'none',
  border: 'none',
  color: '#1890ff',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '4px 0',
  marginBottom: '16px',
  textDecoration: 'none',

  '&:hover': {
    color: '#40a9ff',
  },

  '&:disabled': {
    color: '#bfbfbf',
    cursor: 'not-allowed',
  },
})

export const UnderlinedToggleLink = styled.button({
  background: 'none',
  border: 'none',
  color: '#1890ff',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '4px 0',
  textDecoration: 'underline',

  '&:hover': {
    color: '#40a9ff',
  },

  '&:disabled': {
    color: '#bfbfbf',
    cursor: 'not-allowed',
  },
})

export const SectionTitle = styled.h3({
  margin: '0 0 8px 0',
  fontSize: '16px',
  fontWeight: 600,
  color: '#333',
})

export const SectionDescription = styled.p({
  margin: '0 0 16px 0',
  fontSize: '14px',
  color: '#666',
  lineHeight: 1.5,
})

export const InputWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const UnitLabel = styled.span({
  color: '#666',
  fontSize: '14px',
  minWidth: '20px',
})

export const ErrorMessage = styled.div({
  color: '#ff4d4f',
  fontSize: '14px',
  marginTop: '8px',
  padding: '8px 12px',
  background: '#fff2f0',
  border: '1px solid #ffccc7',
  borderRadius: '6px',
})

export const ButtonGroup = styled.div({
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '24px',
})