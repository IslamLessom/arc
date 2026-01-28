import { Input } from '@restaurant-pos/ui'
import styled from 'styled-components'

export const PageContainer = styled.div(({ theme }) => ({
  padding: '24px',
  backgroundColor: theme.colors.background,
  minHeight: '100vh'
}))

export const Header = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing.lg
}))

export const HeaderLeft = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.md
}))

export const BackButton = styled.button(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  border: `1px solid ${theme.colors.border}`,
  backgroundColor: theme.colors.white,
  borderRadius: theme.borderRadius.md,
  cursor: 'pointer',
  fontSize: '18px',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: theme.colors.backgroundHover,
    borderColor: theme.colors.borderHover
  }
}))

export const Title = styled.h1(({ theme }) => ({
  margin: 0,
  fontSize: '24px',
  fontWeight: '600',
  color: theme.colors.textPrimary
}))

export const HeaderActions = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.sm
}))

export const ActionButton = styled.button(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  border: `1px solid ${theme.colors.border}`,
  backgroundColor: theme.colors.white,
  borderRadius: theme.borderRadius.md,
  cursor: 'pointer',
  fontSize: '14px',
  color: theme.colors.textSecondary,
  transition: theme.transitions.normal,

  '&:hover': {
    backgroundColor: theme.colors.backgroundHover,
    borderColor: theme.colors.borderHover,
    color: theme.colors.textPrimary
  },

  '& span': {
    fontSize: '16px'
  }
}))

export const AddButton = styled.button(({ theme }) => ({
  padding: '10px 20px',
  border: 'none',
  backgroundColor: theme.colors.primary,
  color: theme.colors.white,
  borderRadius: theme.borderRadius.md,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: theme.transitions.normal,

  '&:hover': {
    backgroundColor: theme.colors.primaryHover
  }
}))

export const SearchContainer = styled.div(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.md,
  marginBottom: theme.spacing.lg
}))

export const SearchInputWrapper = styled.div({
  flex: 1,
  position: 'relative',
  maxWidth: '400px'
})

export const SearchIcon = styled.span(({ theme }) => ({
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: theme.colors.textMuted,
  pointerEvents: 'none'
}))

export const FilterButton = styled.button(({ theme }) => ({
  padding: '10px 16px',
  border: `1px solid ${theme.colors.border}`,
  backgroundColor: theme.colors.white,
  borderRadius: theme.borderRadius.md,
  cursor: 'pointer',
  fontSize: '14px',
  color: theme.colors.textSecondary,
  transition: theme.transitions.normal,

  '&:hover': {
    backgroundColor: theme.colors.backgroundHover,
    borderColor: theme.colors.borderHover
  }
}))

export const TableContainer = styled.div(({ theme }) => ({
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.borderRadius.lg,
  overflow: 'hidden',
  backgroundColor: theme.colors.background
}))

export const LoadingContainer = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: theme.colors.textSecondary
}))

export const ErrorContainer = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '400px',
  fontSize: '16px',
  color: theme.colors.danger,
  textAlign: 'center',
  padding: theme.spacing.lg
}))

export const TableActionsContainer = styled.div(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.xs
}))

export const TableSummaryContainer = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderTop: `1px solid ${theme.colors.border}`
}))

export const TableSummaryLabel = styled.span({
  fontWeight: '600'
})

export const SearchInput = styled(Input)({
  width: '100%',
  paddingLeft: '36px'
})