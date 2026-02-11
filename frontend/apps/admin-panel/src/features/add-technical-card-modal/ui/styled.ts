import styled from 'styled-components'

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
  maxWidth: '980px',
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

export const HeaderActions = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const PrintButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#64748b',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    color: '#475569',
  },
})

export const PrintIcon = styled.svg({
  width: '16px',
  height: '16px',
  flexShrink: 0,
})

export const ModalBody = styled.div({
  padding: '24px',
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

export const Select = styled.select<{ $hasError?: boolean }>((props) => ({
  padding: '10px 12px',
  fontSize: '14px',
  border: props.$hasError ? '1px solid #ff4d4f' : '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  cursor: 'pointer',
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

export const RowHint = styled.p({
  margin: 0,
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: 1.4,
})

export const HintLink = styled.span({
  color: '#3b82f6',
  cursor: 'pointer',
})

export const CoverPreview = styled.div({
  width: '96px',
  height: '96px',
  borderRadius: '10px',
  backgroundColor: '#9ca3af',
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

export const CoverImagePreview = styled.div({
  width: '200px',
  height: '200px',
  borderRadius: '8px',
  overflow: 'hidden',
  position: 'relative',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
})

export const RemoveImageButton = styled.button({
  position: 'absolute',
  top: '8px',
  right: '8px',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: '#ffffff',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  lineHeight: 1,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
})

export const OptionsList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const PriceRow = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  flexWrap: 'wrap',
})

export const PriceInputGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  '& input': {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
})

export const UnitLabel = styled.span({
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  height: '38px',
  border: '1px solid #d1d5db',
  borderLeft: 'none',
  borderRadius: '0 6px 6px 0',
  backgroundColor: '#f3f4f6',
  color: '#6b7280',
  fontSize: '14px',
})

export const InfoGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  flexWrap: 'wrap',
})

export const InfoItem = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const InfoLabel = styled.span({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: '#6b7280',
})

export const InfoIcon = styled.span({
  width: '16px',
  height: '16px',
  borderRadius: '999px',
  border: '1px solid #cbd5e1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  color: '#94a3b8',
})

export const InfoValue = styled.span({
  fontSize: '14px',
  fontWeight: 600,
  color: '#111827',
})

export const AdditionalToggle = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#3b82f6',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  width: 'fit-content',
})

export const Chevron = styled.span<{ $isOpen: boolean }>((props) => ({
  width: '8px',
  height: '8px',
  borderRight: '2px solid #3b82f6',
  borderBottom: '2px solid #3b82f6',
  transform: props.$isOpen ? 'rotate(225deg)' : 'rotate(45deg)',
  transition: 'transform 0.2s ease',
}))

export const AdditionalSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  paddingTop: '12px',
})

export const SectionHeader = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const ModifierHeaderRow = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '16px',
  flexWrap: 'wrap',
})

export const SectionTitle = styled.h3({
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: '#111827',
})

export const SectionDescription = styled.p({
  margin: 0,
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: 1.4,
})

export const EmptyStateCard = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '16px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
})

export const EmptyIcon = styled.div({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: '#e2e8f0',
  flexShrink: 0,
})

export const EmptyStateContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const EmptyStateTitle = styled.h4({
  margin: 0,
  fontSize: '14px',
  fontWeight: 600,
  color: '#111827',
})

export const EmptyStateDescription = styled.p({
  margin: 0,
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: 1.4,
})

export const ModifierBanner = styled.div({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  backgroundColor: '#16a34a',
  color: '#ffffff',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 500,
  width: 'fit-content',
})

export const ModifierButton = styled.button({
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  color: '#94a3b8',
  width: '100%',
  textAlign: 'left',
  cursor: 'not-allowed',
})

export const FieldError = styled.span({
  fontSize: '12px',
  color: '#ff4d4f',
  marginTop: '4px',
})

export const ModalFooter = styled.div({
  padding: '16px 24px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  position: 'sticky',
  bottom: 0,
  zIndex: 10,
  pointerEvents: 'auto',
})

export const FooterActions = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '12px',
})

export const IngredientsTable = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const TableHeader = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
  gap: '12px',
  padding: '12px 16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#64748b',
  alignItems: 'center',
})

export const TableRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
  gap: '12px',
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  alignItems: 'center',
  transition: 'border-color 0.2s',
  '&:hover': {
    borderColor: '#cbd5e1',
  },
})

export const TableSelect = styled.select({
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  width: '100%',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
})

export const TableInput = styled.input({
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  width: '100%',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
})

export const NetInputWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  width: '100%',
  '& input': {
    paddingRight: '32px',
  },
})

export const NetInput = styled.input({
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#111827',
  width: '100%',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
  },
})

export const CostInputWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  width: '100%',
})

export const CostInput = styled.input({
  padding: '8px 32px 8px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#f8fafc',
  color: '#64748b',
  width: '100%',
  cursor: 'not-allowed',
})

export const CurrencySymbol = styled.span({
  position: 'absolute',
  right: '12px',
  fontSize: '14px',
  color: '#64748b',
  pointerEvents: 'none',
})

export const HelpIcon = styled.span({
  width: '16px',
  height: '16px',
  borderRadius: '999px',
  border: '1px solid #cbd5e1',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  color: '#94a3b8',
  cursor: 'help',
  marginLeft: '4px',
})

export const DeleteButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  fontSize: '24px',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#94a3b8',
    },
  },
})

export const AddIngredientButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 16px',
  border: '1px dashed #cbd5e1',
  backgroundColor: '#f8fafc',
  color: '#64748b',
  fontSize: '14px',
  fontWeight: 500,
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  width: '100%',
  marginTop: '8px',
  '&:hover': {
    backgroundColor: '#f1f5f9',
    borderColor: '#94a3b8',
    color: '#475569',
  },
  '& span': {
    fontSize: '18px',
    fontWeight: 300,
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
})
