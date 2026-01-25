import styled from 'styled-components'

export const PageContainer = styled.div({
  padding: '24px',
  backgroundColor: '#ffffff',
  minHeight: '100vh'
})

export const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
})

export const BackButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1'
  }
})

export const Title = styled.h1({
  margin: 0,
  fontSize: '24px',
  fontWeight: '600',
  color: '#1e293b'
})

export const PrintButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#64748b',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1'
  }
})

export const FormContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
})

export const FormSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '20px',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  backgroundColor: '#ffffff'
})

export const FormRow = styled.div({
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start'
})

export const FormField = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1
})

export const Label = styled.label({
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569'
})

export const Input = styled.input({
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  transition: 'all 0.2s ease',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  },

  '&::placeholder': {
    color: '#94a3b8'
  }
})

export const Textarea = styled.textarea({
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  minHeight: '100px',
  resize: 'vertical',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
})

export const ErrorMessage = styled.span({
  fontSize: '12px',
  color: '#ef4444',
  marginTop: '4px'
})

export const IngredientsSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
})

export const SectionTitle = styled.h2({
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b'
})

export const IngredientsTable = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
})

export const TableHeader = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr 40px',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase'
})

export const TableRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.5fr 40px',
  gap: '12px',
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  alignItems: 'center'
})

export const TableInput = styled.input({
  padding: '8px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '14px',
  width: '100%',
  transition: 'all 0.2s ease',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
  }
})

export const TableSelect = styled.select({
  padding: '8px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '14px',
  width: '100%',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
  }
})

export const NetInputWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
})

export const NetInput = styled(TableInput)({
  flex: 1
})

export const UnitLabel = styled.span({
  fontSize: '14px',
  color: '#64748b',
  whiteSpace: 'nowrap'
})

export const CostInputWrapper = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
})

export const CostInput = styled(TableInput)({
  paddingRight: '24px'
})

export const CurrencySymbol = styled.span({
  position: 'absolute',
  right: '8px',
  fontSize: '14px',
  color: '#64748b'
})

export const DeleteButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#ef4444',
  fontSize: '18px',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#fee2e2'
  }
})

export const AddIngredientButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#3b82f6',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#eff6ff'
  }
})

export const SummaryRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#64748b'
})

export const SummaryLabel = styled.span({
  fontWeight: '500'
})

export const SummaryValue = styled.span({
  fontWeight: '600',
  color: '#1e293b'
})

export const Footer = styled.div({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '24px',
  padding: '20px',
  borderTop: '1px solid #e2e8f0',
  marginTop: '24px'
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

  '&:hover': {
    backgroundColor: '#059669'
  },

  '&:disabled': {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed'
  }
})

export const HelpIcon = styled.span({
  fontSize: '14px',
  color: '#94a3b8',
  cursor: 'help',
  marginLeft: '4px'
})

