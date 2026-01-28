import styled from 'styled-components'
import { Link } from 'react-router-dom'

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
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr'
  }
})

export const FormField = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
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

export const Select = styled.select({
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
})

export const Textarea = styled.textarea({
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  minHeight: '80px',
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

export const TimeInputs = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
})

export const TimeInput = styled.input({
  width: '60px',
  padding: '10px 8px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  textAlign: 'center',
  transition: 'all 0.2s ease',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
})

export const TimeSeparator = styled.span({
  fontSize: '18px',
  color: '#64748b'
})

export const ItemsTable = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
})

export const ItemsTableHeader = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.5fr 40px',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase'
})

export const ItemRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.5fr 40px',
  gap: '12px',
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  alignItems: 'center'
})

export const ItemInput = styled.input({
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

export const ItemSelect = styled.select({
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

export const PriceInputWrapper = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
})

export const PriceInput = styled(ItemInput)({
  paddingRight: '60px'
})

export const CurrencySymbol = styled.span({
  position: 'absolute',
  right: '12px',
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

export const AddItemButton = styled.button({
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

export const Footer = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px',
  borderTop: '1px solid #e2e8f0',
  marginTop: '24px'
})

export const SaveButton = styled.button({
  padding: '12px 24px',
  border: 'none',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#2563eb'
  },

  '&:disabled': {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed'
  }
})

export const Summary = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '14px',
  color: '#64748b'
})

export const SummaryRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px'
})

export const SummaryLabel = styled.span({
  fontWeight: '500'
})

export const SummaryValue = styled.span({
  fontWeight: '600',
  color: '#1e293b'
})

export const ImportBox = styled.div({
  padding: '20px',
  border: '2px dashed #cbd5e1',
  borderRadius: '12px',
  backgroundColor: '#f8fafc',
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start'
})

export const ImportIconContainer = styled.div({
  color: '#3b82f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

export const ImportContent = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
})

export const ImportTitle = styled.h3({
  margin: 0,
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b'
})

export const ImportText = styled.p({
  margin: 0,
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.5'
})

export const ImportLink = styled(Link)({
  color: '#3b82f6',
  textDecoration: 'none',
  cursor: 'pointer',

  '&:hover': {
    textDecoration: 'underline'
  }
})

export const AddPaymentButton = styled.button({
  padding: '10px 16px',
  border: '1px solid #3b82f6',
  backgroundColor: 'transparent',
  color: '#3b82f6',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  alignSelf: 'flex-start',

  '&:hover': {
    backgroundColor: '#eff6ff'
  }
})

export const PaymentsContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
})

export const PaymentsHeader = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 40px',
  gap: '12px',
  padding: '8px 0',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase'
})

export const PaymentHeaderLabel = styled.span({
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase'
})

export const PaymentRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 40px',
  gap: '12px',
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  alignItems: 'center',
  backgroundColor: '#ffffff'
})

export const PaymentField = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
})

export const PaymentSelect = styled.select({
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: '100%',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
})

export const PaymentInput = styled.input({
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  transition: 'all 0.2s ease',
  width: '100%',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
})

export const PaymentTimeInputs = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
})

export const PaymentTimeInput = styled.input({
  width: '50px',
  padding: '10px 8px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  textAlign: 'center',
  transition: 'all 0.2s ease',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
})

export const PaymentTimeSeparator = styled.span({
  fontSize: '14px',
  color: '#64748b'
})

export const PaymentAmountInput = styled.input({
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1e293b',
  transition: 'all 0.2s ease',
  width: '100%',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
})

export const PaymentDeleteButton = styled.button({
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

export const LoadingContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  fontSize: '16px',
  color: '#64748b'
})

