import styled from 'styled-components'

export const PageContainer = styled.div(({ theme }) => ({
  padding: '24px',
  maxWidth: '100%',
  margin: '0 auto',
  background: theme.colors.background,
  minHeight: '100vh',
  animation: 'fadeIn 0.3s ease',

  '@keyframes fadeIn': {
    'from': {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    'to': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },

  '@media (max-width: 768px)': {
    padding: '16px',
  },

  '@media (max-width: 480px)': {
    padding: '12px',
  },
}))

export const Header = styled.header({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  gap: '16px',
  flexWrap: 'wrap',

  '@media (max-width: 768px)': {
    marginBottom: '16px',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flex: 1,
  minWidth: 0,

  '@media (max-width: 768px)': {
    width: '100%',
  },
})

export const BackButton = styled.button(({ theme }) => ({
  background: theme.colors.backgroundHover,
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.textPrimary,
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '18px',
  flexShrink: 0,

  '&:hover': {
    background: theme.colors.backgroundActive,
    borderColor: theme.colors.borderHover,
    transform: 'translateX(-1px)',
  },

  '&:active': {
    transform: 'translateX(0) scale(0.98)',
  },

  '@media (max-width: 480px)': {
    width: '36px',
    height: '36px',
    fontSize: '16px',
  },
}))

export const Title = styled.h1(({ theme }) => ({
  fontSize: '28px',
  fontWeight: 700,
  color: theme.colors.textPrimary,
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  letterSpacing: '-0.5px',

  '@media (max-width: 768px)': {
    fontSize: '24px',
  },

  '@media (max-width: 480px)': {
    fontSize: '20px',
  },
}))

export const AcccentSpan = styled.span(({ theme }) => ({
  color: theme.colors.accent,
  marginLeft: '4px',
}))

export const SummaryPrice = styled.strong(({ theme }) => ({
  color: theme.colors.accent,
}))

export const HeaderActions = styled.div({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  flexWrap: 'wrap',

  '@media (max-width: 768px)': {
    width: '100%',
    justifyContent: 'stretch',
  },

  '@media (max-width: 480px)': {
    gap: '6px',
  },
})

export const ActionButton = styled.button(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 16px',
  background: theme.colors.backgroundHover,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '10px',
  color: theme.colors.textSecondary,
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',

  '&:hover': {
    background: theme.colors.backgroundActive,
    borderColor: theme.colors.borderHover,
    color: theme.colors.textPrimary,
  },

  '&:active': {
    transform: 'scale(0.98)',
  },

  '& span:first-child': {
    fontSize: '16px',
  },

  'span.action-text': {
    transition: 'opacity 0.2s ease',
  },

  '@media (max-width: 768px)': {
    flex: 1,
    justifyContent: 'center',
    padding: '8px 12px',
    fontSize: '13px',

    '& span:first-child': {
      fontSize: '14px',
    },
  },

  '@media (max-width: 480px)': {
    padding: '8px',
    fontSize: '11px',

    'span.action-text': {
      display: 'none',
    },

    '& span:first-child': {
      fontSize: '18px',
    },
  },
}))

export const AddButton = styled.button(({ theme }) => ({
  padding: '10px 20px',
  background: theme.colors.primary,
  border: 'none',
  borderRadius: '10px',
  color: theme.colors.white,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 2px 8px ${theme.colors.shadow}`,
  whiteSpace: 'nowrap',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
    transition: 'left 0.5s',
  },

  '&:hover': {
    background: theme.colors.primaryHover,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${theme.colors.shadowMedium}`,

    '&::before': {
      left: '100%',
    },
  },

  '&:active': {
    transform: 'translateY(0) scale(0.98)',
  },

  '@media (max-width: 768px)': {
    flex: 1,
    padding: '8px 16px',
  },

  '@media (max-width: 480px)': {
    padding: '8px 12px',
    fontSize: '13px',
  },
}))

export const SearchContainer = styled.div({
  display: 'flex',
  gap: '12px',
  marginBottom: '20px',
  alignItems: 'stretch',

  '@media (max-width: 768px)': {
    marginBottom: '16px',
    flexDirection: 'column',
    gap: '8px',
  },
})

export const SearchInputWrapper = styled.div(({ theme }) => ({
  flex: 1,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',

  '@media (max-width: 768px)': {
    width: '100%',
  },

  '.ant-input': {
    background: theme.colors.backgroundActive,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,

    '&::placeholder': {
      color: theme.colors.textMuted,
    },

    '&:hover': {
      background: theme.colors.backgroundActive,
      borderColor: theme.colors.border,
    },

    '&:focus': {
      background: theme.colors.backgroundActive,
      borderColor: theme.colors.accent,
      boxShadow: `0 0 0 2px ${theme.colors.accentBackground}`,
    },
  },
}))

export const SearchIcon = styled.span({
  position: 'absolute',
  left: '12px',
  fontSize: '18px',
  zIndex: 1,
  pointerEvents: 'none',
  opacity: 0.6,
})

export const FilterButton = styled.button(({ theme }) => ({
  padding: '10px 16px',
  background: theme.colors.backgroundHover,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '10px',
  color: theme.colors.textSecondary,
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',

  '&:hover': {
    background: theme.colors.backgroundActive,
    borderColor: theme.colors.borderHover,
    color: theme.colors.textPrimary,
  },

  '@media (max-width: 768px)': {
    width: '100%',
    justifyContent: 'center',
  },

  '@media (max-width: 480px)': {
    padding: '8px 12px',
    fontSize: '13px',
  },
}))

export const TableContainer = styled.div(({ theme }) => ({
  background: theme.colors.backgroundHover,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: `0 4px 16px ${theme.colors.shadow}`,
  position: 'relative',

  '@media (max-width: 768px)': {
    display: 'none',
  },

  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },

  '::-webkit-scrollbar-track': {
    background: theme.colors.background,
    borderRadius: '4px',
  },

  '::-webkit-scrollbar-thumb': {
    background: theme.colors.borderHover,
    borderRadius: '4px',
    transition: 'background 0.2s',

    '&:hover': {
      background: theme.colors.textMuted,
    },
  },

  '.ant-table': {
    background: 'transparent',
    color: theme.colors.textPrimary,
    fontSize: '14px',

    '@media (max-width: 768px)': {
      fontSize: '13px',
    },
  },

  '.ant-table-row': {
    cursor: 'pointer',

    '&:hover': {
      background: 'transparent !important',
    },
  },

  '.ant-table-thead > tr > th': {
    background: theme.colors.backgroundActive,
    borderBottom: `1px solid ${theme.colors.border}`,
    color: theme.colors.textSecondary,
    fontWeight: 600,
    padding: '16px',
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '0.5px',

    '&:hover': {
      background: `${theme.colors.backgroundActive} !important`,
    },

    '@media (max-width: 768px)': {
      padding: '12px 8px',
      fontSize: '11px',
    },

    '@media (max-width: 480px)': {
      padding: '10px 6px',
      fontSize: '10px',
    },
  },

  '.ant-table-tbody > tr > td': {
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: '16px',
    color: theme.colors.textPrimary,
    background: 'transparent !important',

    '@media (max-width: 768px)': {
      padding: '12px 8px',
    },

    '@media (max-width: 480px)': {
      padding: '10px 6px',
    },
  },

  '.ant-table-tbody > tr': {
    '&:hover': {
      background: 'transparent !important',
    },
  },

  '.ant-table-wrapper': {
    overflowX: 'auto',

    '@media (max-width: 768px)': {
      WebkitOverflowScrolling: 'touch',
    },
  },

  '.ant-table-container': {
    minWidth: '100%',

    '@media (max-width: 768px)': {
      minWidth: '600px',
    },
  },

  '.ant-table-summary': {
    background: theme.colors.backgroundActive,
    borderTop: `2px solid ${theme.colors.border}`,

    '> div > tr > td': {
      background: theme.colors.backgroundActive,
      color: theme.colors.textPrimary,
      fontWeight: 700,
      borderBottom: 'none',
    },
  },

  '.ant-empty': {
    color: theme.colors.textSecondary,
  },

  '.ant-empty-description': {
    color: theme.colors.textMuted,
  },
}))

export const LoadingContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: '16px',

  '&::before': {
    content: '""',
    width: '48px',
    height: '48px',
    border: `3px solid ${theme.colors.border}`,
    borderTopColor: theme.colors.accent,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  '@keyframes spin': {
    'to': {
      transform: 'rotate(360deg)',
    },
  },

  '> span': {
    color: theme.colors.textSecondary,
    fontSize: '18px',
    fontWeight: 500,
  },

  '@media (max-width: 768px)': {
    minHeight: '300px',

    '&::before': {
      width: '40px',
      height: '40px',
    },

    '> span': {
      fontSize: '16px',
    },
  },
}))

export const ErrorContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  color: theme.colors.danger,
  fontSize: '16px',
  textAlign: 'center',
  padding: '20px',
  borderRadius: '12px',
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.15)',

  '@media (max-width: 768px)': {
    minHeight: '300px',
    fontSize: '14px',
    padding: '16px',
  },
}))

export const MobileActionsDropdown = styled.div<{ isOpen: boolean }>({
  display: 'none',

  '@media (max-width: 480px)': {
    display: ({ isOpen }) => (isOpen ? 'block' : 'none'),
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: ({ theme }) => theme.colors.backgroundHover,
    borderTop: `1px solid ${({ theme }) => theme.colors.border}`,
    padding: '12px',
    boxShadow: `0 -4px 16px ${({ theme }) => theme.colors.shadow}`,
    zIndex: 1000,
    animation: 'slideUp 0.3s ease',

    '@keyframes slideUp': {
      from: {
        transform: 'translateY(100%)',
      },
      to: {
        transform: 'translateY(0)',
      },
    },
  },
})

export const MobileActionsGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px',

  '@media (max-width: 360px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
})

export const MobileActionItem = styled.button(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  padding: '12px 8px',
  background: theme.colors.backgroundActive,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '8px',
  color: theme.colors.textSecondary,
  fontSize: '11px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: theme.colors.backgroundHover,
    borderColor: theme.colors.borderHover,
    color: theme.colors.textPrimary,
  },

  '& span': {
    fontSize: '20px',
  },
}))

export const MobileMenuButton = styled.button<{ isVisible: boolean }>({
  display: 'none',

  '@media (max-width: 480px)': {
    display: ({ isVisible }) => (isVisible ? 'flex' : 'none'),
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: ({ theme }) => theme.colors.primary,
    border: 'none',
    boxShadow: `0 4px 16px ${({ theme }) => theme.colors.shadow}`,
    color: ({ theme }) => theme.colors.white,
    fontSize: '24px',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    zIndex: 999,

    '&:hover': {
      transform: 'scale(1.1)',
      background: ({ theme }) => theme.colors.primaryHover,
      boxShadow: `0 6px 20px ${({ theme }) => theme.colors.shadow}`,
    },

    '&:active': {
      transform: 'scale(1.05)',
    },
  },
})

export const MobileCardsContainer = styled.div({
  display: 'none',
  animation: 'fadeIn 0.3s ease',

  '@media (max-width: 768px)': {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
})

export const IngredientCard = styled.div(({ theme }) => ({
  background: theme.colors.backgroundHover,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  animation: 'slideIn 0.3s ease',

  '@keyframes slideIn': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },

  '&:hover': {
    borderColor: theme.colors.borderHover,
    boxShadow: `0 2px 12px ${theme.colors.shadow}`,
    transform: 'translateY(-1px)',
  },

  '&:active': {
    transform: 'translateY(0)',
  },
}))

export const CardHeader = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '12px',
  gap: '12px',
})

export const CardTitle = styled.h3(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 600,
  color: theme.colors.textPrimary,
  margin: 0,
  wordBreak: 'break-word',
  flex: 1,
  lineHeight: 1.4,
}))

export const CardActions = styled.div({
  display: 'flex',
  gap: '4px',
  flexShrink: 0,
})

export const CardAction = styled.button(({ theme }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: theme.colors.backgroundActive,
  border: `1px solid ${theme.colors.border}`,
  color: theme.colors.textSecondary,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',

  '&:hover': {
    background: theme.colors.accentBackground,
    borderColor: theme.colors.accentLight,
    color: theme.colors.accentLight,
    transform: 'scale(1.05)',
  },

  '&:active': {
    transform: 'scale(1.02)',
  },
}))

export const CardContent = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
})

export const CardRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '8px',
})

export const CardLabel = styled.span(({ theme }) => ({
  fontSize: '13px',
  color: theme.colors.textSecondary,
  flexShrink: 0,
}))

export const CardValue = styled.span<{ $accent?: boolean }>(({ theme, $accent }) => ({
  fontSize: '14px',
  color: $accent ? theme.colors.accent : theme.colors.textPrimary,
  fontWeight: 500,
  textAlign: 'right',
  wordBreak: 'break-word',
}))

export const CardCategory = styled.div(({ theme }) => ({
  display: 'inline-block',
  padding: '4px 10px',
  background: theme.colors.accentBackground,
  color: theme.colors.accentLight,
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 500,
}))

export const CardStock = styled.div<{ $low?: boolean }>(({ theme, $low }) => ({
  padding: '6px 12px',
  background: $low
    ? 'rgba(239, 68, 68, 0.08)'
    : 'rgba(16, 185, 129, 0.08)',
  color: $low ? theme.colors.danger : theme.colors.success,
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  textAlign: 'right',
}))

export const CardCost = styled.div(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 700,
  color: theme.colors.accentLight,
}))

export const SummaryCard = styled.div(({ theme }) => ({
  display: 'none',
  background: `linear-gradient(135deg, ${theme.colors.backgroundActive} 0%, ${theme.colors.backgroundHover} 100%)`,
  border: `1px solid ${theme.colors.borderHover}`,
  borderRadius: '16px',
  padding: '16px',
  marginTop: '16px',
  boxShadow: `0 4px 16px ${theme.colors.shadow}`,

  '@media (max-width: 768px)': {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
}))

export const SummaryTitle = styled.h4(({ theme }) => ({
  fontSize: '14px',
  fontWeight: 600,
  color: theme.colors.textSecondary,
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}))

export const SummaryStats = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
})

export const SummaryItem = styled.div(({ theme }) => ({
  background: theme.colors.background,
  borderRadius: '12px',
  padding: '12px',
  border: `1px solid ${theme.colors.border}`,
}))

export const SummaryItemLabel = styled.div(({ theme }) => ({
  fontSize: '12px',
  color: theme.colors.textSecondary,
  marginBottom: '4px',
}))

export const SummaryItemValue = styled.div<{ $accent?: boolean }>(({ theme, $accent }) => ({
  fontSize: '18px',
  fontWeight: 700,
  color: $accent ? theme.colors.accentLight : theme.colors.textPrimary,
}))

export const EmptyState = styled.div({
  display: 'none',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
  textAlign: 'center',
  animation: 'fadeIn 0.3s ease',

  '@media (max-width: 768px)': {
    display: 'flex',
  },

  '@media (min-width: 769px)': {
    display: 'none !important',
  },
})

export const EmptyStateIcon = styled.div({
  fontSize: '48px',
  marginBottom: '16px',
  opacity: 0.5,
})

export const EmptyStateText = styled.div(({ theme }) => ({
  fontSize: '16px',
  color: theme.colors.textSecondary,
  marginBottom: '8px',
}))

export const EmptyStateSubtext = styled.div(({ theme }) => ({
  fontSize: '14px',
  color: theme.colors.textMuted,
}))
