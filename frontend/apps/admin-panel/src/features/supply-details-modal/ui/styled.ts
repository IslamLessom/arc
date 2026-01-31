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
  animation: 'fadeIn 0.2s ease-out',
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
}))

export const ModalContainer = styled.div({
  backgroundColor: ({ theme }) => theme.colors.background,
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  maxWidth: '800px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  animation: 'slideUp 0.3s ease-out',
  '@keyframes slideUp': {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
})

export const ModalHeader = styled.div({
  padding: '20px 24px',
  borderBottom: `1px solid ${({ theme }) => theme.colors.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
})

export const HeaderActions = styled.div({
  display: 'flex',
  gap: '8px',
})

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>((props) => ({
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  border: '1px solid transparent',
  transition: 'all 0.2s',
  backgroundColor: props.$variant === 'primary'
    ? ({ theme }: any) => theme.colors.primary
    : props.$variant === 'danger'
      ? ({ theme }: any) => theme.colors.danger
      : 'transparent',
  color: props.$variant === 'primary' || props.$variant === 'danger'
    ? '#fff'
    : ({ theme }: any) => theme.colors.textSecondary,
  '&:hover': {
    opacity: 0.9,
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}))

export const HeaderContent = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const HeaderIcon = styled.div({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: ({ theme }) => theme.colors.backgroundHover,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
})

export const HeaderTitle = styled.h2({
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: ({ theme }) => theme.colors.textPrimary,
})

export const HeaderSubtitle = styled.p({
  margin: '2px 0 0',
  fontSize: '13px',
  color: ({ theme }) => theme.colors.textSecondary,
})

export const CloseButton = styled.button({
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: ({ theme }) => theme.colors.textSecondary,
  padding: '0',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: ({ theme }) => theme.colors.backgroundHover,
    color: ({ theme }) => theme.colors.textPrimary,
  },
})

export const ModalBody = styled.div({
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
})

export const Section = styled.div({
  marginBottom: '24px',
  '&:last-child': {
    marginBottom: 0,
  },
})

export const SectionTitle = styled.h3({
  margin: '0 0 16px',
  fontSize: '14px',
  fontWeight: 600,
  color: ({ theme }) => theme.colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const SectionIcon = styled.span({
  fontSize: '16px',
})

export const InfoGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
})

export const InfoCard = styled.div({
  backgroundColor: 'transparent',
  borderRadius: '8px',
  padding: '12px 0',
  border: 'none',
})

export const DebtInfoCard = styled.div({
  marginTop: '16px',
  padding: '12px',
  borderRadius: '8px',
  border: `1px solid ${({ theme }) => theme.colors.danger}33`,
  backgroundColor: ({ theme }) => theme.colors.danger + '11',
})

export const InfoLabel = styled.div({
  fontSize: '12px',
  color: ({ theme }) => theme.colors.textSecondary,
  marginBottom: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
})

export const InfoLabelIcon = styled.span({
  fontSize: '14px',
})

export const InfoValue = styled.div({
  fontSize: '15px',
  fontWeight: 500,
  color: ({ theme }) => theme.colors.textPrimary,
  wordBreak: 'break-word',
})

export const DebtInfoLabel = styled.div({
  fontSize: '12px',
  color: ({ theme }) => theme.colors.danger,
  marginBottom: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
})

export const DebtInfoValue = styled.div({
  fontSize: '18px',
  fontWeight: 500,
  color: ({ theme }) => theme.colors.danger,
  wordBreak: 'break-word',
})

export const MonospaceInfoValue = styled.div({
  fontSize: '13px',
  fontWeight: 500,
  color: ({ theme }) => theme.colors.textPrimary,
  fontFamily: 'monospace',
  wordBreak: 'break-word',
})

export const SmallInfoValue = styled.div({
  fontSize: '13px',
  fontWeight: 500,
  color: ({ theme }) => theme.colors.textPrimary,
  wordBreak: 'break-word',
})

export const EditableInput = styled.input({
  padding: '8px 12px',
  border: `1px solid ${({ theme }) => theme.colors.border}`,
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: 500,
  color: ({ theme }) => theme.colors.textPrimary,
  width: '100%',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: ({ theme }) => theme.colors.primary,
  },
})

export const EditableSelect = styled.select({
  padding: '8px 12px',
  border: `1px solid ${({ theme }) => theme.colors.border}`,
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: 500,
  color: ({ theme }) => theme.colors.textPrimary,
  width: '100%',
  backgroundColor: '#fff',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: ({ theme }) => theme.colors.primary,
  },
})

export const EditableTextArea = styled.textarea({
  padding: '12px',
  border: `1px solid ${({ theme }) => theme.colors.border}`,
  borderRadius: '8px',
  fontSize: '14px',
  color: ({ theme }) => theme.colors.textPrimary,
  width: '100%',
  minHeight: '80px',
  resize: 'vertical',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
  '&:focus': {
    outline: 'none',
    borderColor: ({ theme }) => theme.colors.primary,
  },
})

export const StatusBadge = styled.div<{ $status: string }>((props) => {
  const statusColors = {
    completed: { bg: ({ theme }: any) => theme.colors.success + '20', color: ({ theme }: any) => theme.colors.success, icon: '✓' },
    pending: { bg: ({ theme }: any) => '#fef3c7', color: '#92400e', icon: '⏳' },
    cancelled: { bg: ({ theme }: any) => theme.colors.danger + '20', color: ({ theme }: any) => theme.colors.danger, icon: '✕' },
  } as const

  const colors = statusColors[props.$status as keyof typeof statusColors] || statusColors.pending

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: typeof colors.bg === 'function' ? colors.bg(props) : colors.bg,
    color: typeof colors.color === 'function' ? colors.color(props) : colors.color,
  }
})

export const ItemsTable = styled.div({
  backgroundColor: 'transparent',
  borderRadius: '12px',
  overflow: 'hidden',
  border: `1px solid ${({ theme }) => theme.colors.border}`,
})

export const ItemsTableHeader = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
  gap: '12px',
  padding: '12px 16px',
  backgroundColor: ({ theme }) => theme.colors.backgroundHover,
  borderBottom: `1px solid ${({ theme }) => theme.colors.border}`,
  fontSize: '12px',
  fontWeight: 600,
  color: ({ theme }) => theme.colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
})

export const ItemsTableRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
  gap: '12px',
  padding: '14px 16px',
  borderBottom: `1px solid ${({ theme }) => theme.colors.border}`,
  fontSize: '14px',
  color: ({ theme }) => theme.colors.textPrimary,
  transition: 'background-color 0.15s',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: ({ theme }) => theme.colors.backgroundHover,
  },
})

export const ItemName = styled.div({
  fontWeight: 500,
  color: ({ theme }) => theme.colors.textPrimary,
})

export const ItemSecondary = styled.div({
  fontSize: '12px',
  color: ({ theme }) => theme.colors.textSecondary,
  marginTop: '2px',
})

export const ItemValue = styled.div({
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  color: ({ theme }) => theme.colors.textPrimary,
})

export const TotalRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  backgroundColor: ({ theme }) => theme.colors.backgroundHover,
  borderTop: `1px solid ${({ theme }) => theme.colors.border}`,
  borderRadius: '0 0 12px 12px',
})

export const TotalLabel = styled.span({
  fontSize: '15px',
  fontWeight: 600,
  color: ({ theme }) => theme.colors.textPrimary,
})

export const TotalAmount = styled.span({
  fontSize: '20px',
  fontWeight: 700,
  color: ({ theme }) => theme.colors.primary,
})

export const CommentBox = styled.div({
  backgroundColor: ({ theme }) => theme.colors.backgroundHover,
  border: `1px solid ${({ theme }) => theme.colors.border}`,
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  gap: '12px',
})

export const CommentIcon = styled.span({
  fontSize: '18px',
  flexShrink: 0,
})

export const CommentText = styled.p({
  margin: 0,
  fontSize: '14px',
  color: ({ theme }) => theme.colors.textPrimary,
  lineHeight: '1.6',
})

export const EmptyState = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  color: ({ theme }) => theme.colors.textSecondary,
})

export const EmptyStateIcon = styled.span({
  fontSize: '48px',
  marginBottom: '12px',
  opacity: 0.5,
})

export const EmptyStateText = styled.p({
  margin: 0,
  fontSize: '15px',
})

export const LoadingContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
})

export const Spinner = styled.div({
  width: '48px',
  height: '48px',
  border: `4px solid ${({ theme }) => theme.colors.border}`,
  borderTop: `4px solid ${({ theme }) => theme.colors.primary}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
})

export const LoadingText = styled.p({
  margin: '16px 0 0',
  fontSize: '14px',
  color: ({ theme }) => theme.colors.textSecondary,
})

export const ErrorContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  gap: '12px',
})

export const ErrorIcon = styled.span({
  fontSize: '48px',
})

export const ErrorText = styled.p({
  margin: 0,
  fontSize: '15px',
  color: ({ theme }) => theme.colors.danger,
})
