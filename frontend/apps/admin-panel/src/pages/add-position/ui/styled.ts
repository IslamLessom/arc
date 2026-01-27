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
  marginBottom: '32px'
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

export const FormContainer = styled.div({
  maxWidth: '900px'
})

export const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px'
})

export const FormSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  paddingBottom: '32px',
  borderBottom: '1px solid #e2e8f0',

  '&:last-child': {
    borderBottom: 'none',
  }
})

export const SectionTitle = styled.h3({
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b'
})

export const SectionDescription = styled.p({
  margin: 0,
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.5'
})

export const FormRow = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
})

export const RowLabel = styled.label({
  fontSize: '14px',
  fontWeight: '500',
  color: '#334155'
})

export const RowContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
})

export const Required = styled.span({
  color: '#ef4444',
  marginLeft: '2px'
})

export const StyledInput = styled.input<{ $hasError?: boolean }>({
  width: '100%',
  maxWidth: '400px',
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  outline: 'none',

  '&:focus': {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },

  ...(props => props.$hasError ? {
    borderColor: '#ef4444',
    '&:focus': {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    },
  } : {}),

  '&:disabled': {
    backgroundColor: '#f1f5f9',
    cursor: 'not-allowed',
  },
})

export const FieldError = styled.span({
  fontSize: '12px',
  color: '#ef4444'
})

export const RowHint = styled.span({
  fontSize: '12px',
  color: '#64748b'
})

export const HelpText = styled.span({
  fontSize: '12px',
  color: '#94a3b8'
})

export const CheckboxWrapper = styled.div({
  display: 'flex',
  alignItems: 'center'
})

export const CheckboxLabel = styled.label({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#334155',
  cursor: 'pointer',
  userSelect: 'none'
})

export const StyledCheckbox = styled.input({
  cursor: 'pointer',
  width: '16px',
  height: '16px',
  accentColor: '#3b82f6'
})

export const HelpIcon = styled.span({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  backgroundColor: '#6c757d',
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: '600',
  cursor: 'help',
  marginLeft: '4px'
})

export const AccessTable = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  overflow: 'hidden'
})

export const AccessTableHead = styled.thead({
  backgroundColor: '#f8fafc'
})

export const AccessTableRow = styled.tr({
  borderBottom: '1px solid #e2e8f0',

  '&:last-child': {
    borderBottom: 'none'
  }
})

export const AccessTableCell = styled.td({
  padding: '12px 16px'
})

export const AccessTableHeaderCell = styled.th({
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '500',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
})

export const RadioLabel = styled.label({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer'
})

export const StyledRadio = styled.input({
  cursor: 'pointer',
  width: '16px',
  height: '16px',
  accentColor: '#3b82f6'
})

export const SalarySection = styled.div({
  padding: '20px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
})

export const SalarySectionTitle = styled.h4({
  margin: 0,
  fontSize: '15px',
  fontWeight: '500',
  color: '#334155',
  display: 'flex',
  alignItems: 'center'
})

export const FixedRateInputs = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap'
})

export const RateInputGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
})

export const RateInput = styled(StyledInput)({
  width: '100px',
  textAlign: 'right'
})

export const RateLabel = styled.span({
  fontSize: '14px',
  color: '#64748b'
})

export const RateSeparator = styled.span({
  fontSize: '14px',
  color: '#cbd5e1'
})

export const SalesPercentageRow = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
})

export const CategorySelect = styled.select({
  flex: 1,
  padding: '10px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  outline: 'none',

  '&:focus': {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }
})

export const PercentageInput = styled(StyledInput)({
  width: '80px',
  textAlign: 'right',
  paddingRight: '24px'
})

export const PercentageSuffix = styled.span({
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '14px',
  color: '#94a3b8',
  pointerEvents: 'none'
})

export const PercentageWrapper = styled.div({
  position: 'relative'
})

export const AddCategoryLink = styled.button({
  background: 'none',
  border: 'none',
  color: '#1a73e8',
  fontSize: '14px',
  cursor: 'pointer',
  textDecoration: 'underline',
  padding: '4px 0',
  alignSelf: 'flex-start',

  '&:hover': {
    textDecoration: 'none'
  }
})

export const Link = styled.a({
  color: '#1a73e8',
  textDecoration: 'underline',
  cursor: 'pointer',

  '&:hover': {
    textDecoration: 'none'
  }
})

export const FormActions = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  paddingTop: '32px',
  borderTop: '1px solid #e2e8f0'
})

export const CancelButton = styled.button({
  padding: '10px 24px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  color: '#475569',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1'
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
})

export const SaveButton = styled.button<{ $disabled?: boolean }>((props) => ({
  padding: '10px 24px',
  border: 'none',
  backgroundColor: props.$disabled ? '#cbd5e1' : '#34a853',
  color: '#ffffff',
  borderRadius: '8px',
  cursor: props.$disabled ? 'not-allowed' : 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  ...(!props.$disabled ? {
    '&:hover': {
      backgroundColor: '#2d8e47'
    }
  } : {})
}))

export const ErrorMessage = styled.div({
  padding: '12px 16px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  color: '#dc2626',
  fontSize: '14px'
})

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#64748b'
})
