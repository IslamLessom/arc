import { Input } from '@restaurant-pos/ui'
import styled from 'styled-components'

export const PageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: '#f8fafc',
})

export const Header = styled.header({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
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
    borderColor: '#cbd5e1',
  },
})

export const HeaderTitle = styled.h1({
  margin: 0,
  fontSize: '20px',
  fontWeight: '600',
  color: '#1e293b',
})

export const HeaderSubtitle = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#64748b',
  marginTop: '4px',
})

export const StatusBadge = styled.span<{ $color: string }>(({ $color }) => ({
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
  color: $color,
  backgroundColor: `${$color}15`,
}))

export const HeaderActions = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' | 'outline' }>(
  ({ $variant = 'outline' }) => ({
    padding: '10px 20px',
    border: $variant === 'outline' ? '1px solid #e2e8f0' : 'none',
    backgroundColor:
      $variant === 'primary' ? '#3b82f6' : $variant === 'danger' ? '#ef4444' : '#ffffff',
    color: $variant === 'primary' || $variant === 'danger' ? '#ffffff' : '#64748b',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    opacity: 1,

    '&:hover': {
      backgroundColor:
        $variant === 'primary'
          ? '#2563eb'
          : $variant === 'danger'
            ? '#dc2626'
            : '#f8fafc',
    },

    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  })
)

export const Content = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  padding: '24px',
})

export const InfoSection = styled.div({
  display: 'flex',
  gap: '16px',
  padding: '16px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  marginBottom: '16px',
  border: '1px solid #e2e8f0',
})

export const InfoBlock = styled.div({
  flex: 1,
})

export const InfoLabel = styled.div({
  fontSize: '12px',
  color: '#64748b',
  marginBottom: '4px',
})

export const InfoValue = styled.div({
  fontSize: '16px',
  fontWeight: '500',
  color: '#1e293b',
})

export const TabsContainer = styled.div({
  display: 'flex',
  backgroundColor: '#ffffff',
  borderRadius: '12px 12px 0 0',
  borderBottom: '1px solid #e2e8f0',
})

export const TabButton = styled.button<{ $active: boolean }>(({ $active }) => ({
  flex: 1,
  padding: '16px',
  border: 'none',
  backgroundColor: 'transparent',
  borderBottom: $active ? '2px solid #3b82f6' : 'none',
  color: $active ? '#3b82f6' : '#64748b',
  fontSize: '14px',
  fontWeight: $active ? '600' : '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    color: $active ? '#3b82f6' : '#475569',
    backgroundColor: '#f8fafc',
  },
}))

export const TableContainer = styled.div({
  flex: 1,
  backgroundColor: '#ffffff',
  borderRadius: '0 0 12px 12px',
  border: '1px solid #e2e8f0',
  borderTop: 'none',
  overflow: 'auto',
})

export const Table = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '1200px',
})

export const TableHead = styled.thead({
  position: 'sticky',
  top: 0,
  backgroundColor: '#f8fafc',
  zIndex: 10,
})

export const TableRow = styled.tr({
  '&:hover': {
    backgroundColor: '#f8fafc',
  },
})

export const TableCell = styled.th({
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap',
})

export const TableDataCell = styled.td<{ $align?: 'left' | 'right' | 'center' }>(
  ({ $align = 'left' }) => ({
    padding: '12px 16px',
    fontSize: '14px',
    color: '#1e293b',
    borderBottom: '1px solid #e2e8f0',
    textAlign: $align,
  })
)

export const QuantityInput = styled(Input)<{ $hasError?: boolean }>(({
  $hasError = false,
}) => ({
  width: '100px',
  textAlign: 'right',
  padding: '6px 12px',
  border: $hasError ? '1px solid #ef4444' : '1px solid #e2e8f0',
  backgroundColor: $hasError ? '#fef2f2' : '#ffffff',
  boxShadow: $hasError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',

  '&:focus': {
    borderColor: $hasError ? '#ef4444' : '#3b82f6',
    boxShadow: $hasError
      ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
      : '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },

  '&::placeholder': {
    color: $hasError ? '#ef4444' : '#94a3b8',
  },
}))

export const DifferenceValue = styled.span<{ $color: string }>(({ $color }) => ({
  color: $color,
  fontWeight: '500',
}))

export const FooterBar = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #e2e8f0',
})

export const FooterStats = styled.div({
  display: 'flex',
  gap: '32px',
})

export const StatBlock = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const StatLabel = styled.div({
  fontSize: '12px',
  color: '#64748b',
})

export const StatValue = styled.div<{ $color?: string }>(({ $color }) => ({
  fontSize: '18px',
  fontWeight: '600',
  color: $color || '#1e293b',
}))

export const SearchInput = styled(Input)({
  width: '300px',
})

export const CommentSection = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const CommentTextarea = styled.textarea({
  width: '100%',
  minHeight: '80px',
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'inherit',
  resize: 'vertical',

  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
  },

  '&:disabled': {
    backgroundColor: '#f8fafc',
    cursor: 'not-allowed',
  },
})

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#64748b',
})

export const ErrorContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: '#ef4444',
})

export const EmptyState = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 24px',
  textAlign: 'center',
})

export const EmptyStateTitle = styled.h3({
  margin: '0 0 12px 0',
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
})

export const EmptyStateText = styled.p({
  margin: 0,
  fontSize: '14px',
  color: '#64748b',
})

export const ValidationAlert = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  marginBottom: '16px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
})

export const ValidationIcon = styled.span({
  fontSize: '20px',
})

export const ValidationText = styled.span({
  fontSize: '14px',
  color: '#991b1b',
  fontWeight: '500',
})
