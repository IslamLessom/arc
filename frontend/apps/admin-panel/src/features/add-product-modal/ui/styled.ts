import styled from 'styled-components'
import { Input } from '@restaurant-pos/ui'
import { Alert } from 'antd'

export const Overlay = styled.div<{ $isOpen: boolean }>((props) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.35)',
  display: props.$isOpen ? 'flex' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '24px',
}))

export const ModalContainer = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
  maxWidth: '900px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
})

export const PageHeader = styled.div({
  padding: '20px 24px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const BackButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px',
  color: '#64748b',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    color: '#475569',
  },
})

export const HeaderTitle = styled.h2({
  margin: 0,
  fontSize: '22px',
  fontWeight: 600,
  color: '#1f2937',
})

export const ModalBody = styled.div({
  padding: '24px',
})

export const InfoBanner = styled.div({
  padding: '12px 16px',
  backgroundColor: '#dbeafe',
  borderRadius: '8px',
  marginBottom: '24px',
  fontSize: '14px',
  color: '#1e40af',
  lineHeight: 1.5,
})

export const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
})

export const FormRows = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

export const FormRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '180px 1fr',
  gap: '16px',
  alignItems: 'start',
})

export const RowLabel = styled.label({
  fontSize: '14px',
  fontWeight: 500,
  color: '#374151',
  paddingTop: '8px',
})

export const RowContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const Required = styled.span({
  color: '#ef4444',
})

export const TextArea = styled.textarea<{ $hasError?: boolean }>((props) => ({
  padding: '10px 12px',
  fontSize: '14px',
  border: props.$hasError ? '1px solid #ff4d4f' : '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  fontFamily: 'inherit',
  resize: 'vertical',
  minHeight: '80px',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: props.$hasError ? '#ff4d4f' : '#3b82f6',
    boxShadow: props.$hasError
      ? '0 0 0 2px rgba(255, 77, 79, 0.2)'
      : '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
  '&:hover': {
    borderColor: props.$hasError ? '#ff4d4f' : '#94a3b8',
  },
}))

export const FieldError = styled.span({
  fontSize: '12px',
  color: '#ef4444',
})

export const Select = styled.select<{ $hasError?: boolean }>((props) => ({
  padding: '10px 12px',
  fontSize: '14px',
  border: props.$hasError ? '1px solid #ff4d4f' : '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
  cursor: 'pointer',
  '&:focus': {
    outline: 'none',
    borderColor: props.$hasError ? '#ff4d4f' : '#3b82f6',
    boxShadow: props.$hasError
      ? '0 0 0 2px rgba(255, 77, 79, 0.2)'
      : '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
  '&:hover': {
    borderColor: props.$hasError ? '#ff4d4f' : '#94a3b8',
  },
}))

export const Checkbox = styled.label({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
  userSelect: 'none',
  '& input[type="checkbox"]': {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
})

export const ModalFooter = styled.div({
  padding: '20px 24px',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
})

export const FooterActions = styled.div({
  display: 'flex',
  gap: '12px',
})

export const StyledInput = styled(Input)<{ $hasError?: boolean }>((props) => ({
  borderColor: props.$hasError ? '#ff4d4f' : undefined,
  '&:focus': {
    borderColor: props.$hasError ? '#ff4d4f' : undefined,
    boxShadow: props.$hasError ? '0 0 0 2px rgba(255, 77, 79, 0.2)' : undefined,
  },
}))

export const SaveButton = styled.button<{ $disabled?: boolean }>((props) => ({
  padding: '10px 20px',
  border: 'none',
  backgroundColor: props.$disabled ? '#9ca3af' : '#10b981',
  color: '#ffffff',
  borderRadius: '8px',
  cursor: props.$disabled ? 'not-allowed' : 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: props.$disabled ? '#9ca3af' : '#059669',
  },
}))

export const InputGroup = styled.div({
  display: 'flex',
  gap: '12px',
})

export const FormContainer = styled.div({
  display: 'grid',
  gridTemplateColumns: '1fr 200px',
  gap: '32px',
})

export const FormContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
})

export const HelpColumn = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingTop: '8px',
})

export const HelpLink = styled.a({
  fontSize: '14px',
  color: '#3b82f6',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'color 0.2s',
  '&:hover': {
    color: '#2563eb',
    textDecoration: 'underline',
  },
})

export const CoverImagePlaceholder = styled.div({
  width: '200px',
  height: '200px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#9ca3af',
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: '#e5e7eb',
  },
  '& input[type="file"]': {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
  },
  '& span': {
    pointerEvents: 'none',
    textAlign: 'center',
    padding: '0 16px',
    zIndex: 0,
  },
})

export const ModificationsGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

export const RadioGroup = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const Radio = styled.label({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
  userSelect: 'none',
  '& input[type="radio"]': {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  '& span': {
    flex: 1,
  },
})

export const BarcodeInput = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const PriceCalculation = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '12px',
  flexWrap: 'wrap',
})

export const PriceInputWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  minWidth: '150px',
})

export const PriceInputGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  position: 'relative',
})

export const CurrencySymbol = styled.span({
  fontSize: '14px',
  color: '#6b7280',
  marginLeft: '4px',
})

export const PercentSymbol = styled.span({
  fontSize: '14px',
  color: '#6b7280',
  marginLeft: '4px',
})

export const PlusIcon = styled.span({
  fontSize: '18px',
  color: '#6b7280',
  fontWeight: 500,
  paddingBottom: '8px',
})

export const EqualsIcon = styled.span({
  fontSize: '18px',
  color: '#6b7280',
  fontWeight: 500,
  paddingBottom: '8px',
})

export const TotalInput = styled.input({
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#f9fafb',
  color: '#111827',
  fontFamily: 'inherit',
  cursor: 'not-allowed',
  flex: 1,
  '&:focus': {
    outline: 'none',
  },
})

export const SaveAndCreateButton = styled.button<{ $disabled?: boolean }>((props) => ({
  padding: '10px 20px',
  border: `1px solid ${props.$disabled ? '#d1d5db' : '#10b981'}`,
  backgroundColor: '#ffffff',
  color: props.$disabled ? '#9ca3af' : '#10b981',
  borderRadius: '8px',
  cursor: props.$disabled ? 'not-allowed' : 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: props.$disabled ? '#ffffff' : '#f0fdf4',
    borderColor: props.$disabled ? '#d1d5db' : '#059669',
  },
}))

export const ErrorAlert = styled(Alert)({
  marginBottom: '16px',
})
