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
  width: '100%',
  maxWidth: '900px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
})

export const ModalHeader = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: '1px solid #e2e8f0',
})

export const ModalTitle = styled.h2({
  margin: 0,
  fontSize: '20px',
  fontWeight: '600',
  color: '#1e293b',
})

export const CloseButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: '6px',
  cursor: 'pointer',
  color: '#64748b',
  fontSize: '20px',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
})

export const ModalBody = styled.div({
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
})

export const FormContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
})

export const FormSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

export const FormRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  },
})

export const FormField = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const Label = styled.label({
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569',
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
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },

  '&::placeholder': {
    color: '#94a3b8',
  },
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
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
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
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
})

export const ErrorMessage = styled.span({
  fontSize: '12px',
  color: '#ef4444',
  marginTop: '4px',
})

export const TimeInputs = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
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
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
})

export const TimeSeparator = styled.span({
  fontSize: '18px',
  color: '#64748b',
})

export const ItemsTable = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const ItemsTableHeader = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 40px',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
})

export const ItemRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 40px',
  gap: '12px',
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  alignItems: 'center',
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
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
  },
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
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
  },
})

export const PriceInputWrapper = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
})

export const PriceInput = styled(ItemInput)({
  paddingRight: '40px',
})

export const CurrencySymbol = styled.span({
  position: 'absolute',
  right: '12px',
  fontSize: '14px',
  color: '#64748b',
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
    backgroundColor: '#fee2e2',
  },
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
    backgroundColor: '#eff6ff',
  },
})

export const Footer = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderTop: '1px solid #e2e8f0',
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
    backgroundColor: '#059669',
  },

  '&:disabled': {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
})

export const Summary = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: '14px',
  color: '#64748b',
})

export const SummaryRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px',
})

export const SummaryLabel = styled.span({
  fontWeight: '500',
})

export const SummaryValue = styled.span({
  fontWeight: '600',
  color: '#1e293b',
  fontSize: '18px',
})

export const ErrorAlert = styled.div({
  padding: '12px 16px',
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  borderRadius: '8px',
  marginBottom: '16px',
  fontSize: '14px',
})

