import styled from 'styled-components'

export const PageContainer = styled.div(({ theme }) => ({
  padding: '24px',
  maxWidth: '1400px',
  margin: '0 auto',
  backgroundColor: theme.colors.background,
  minHeight: '100vh',
}))

export const Header = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing.lg,
  paddingBottom: theme.spacing.md,
  borderBottom: `1px solid ${theme.colors.border}`,
}))

export const HeaderLeft = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.md,
}))

export const BackButton = styled.button(({ theme }) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: theme.borderRadius.md,
  color: theme.colors.textSecondary,
  transition: theme.transitions.normal,

  '&:hover': {
    backgroundColor: theme.colors.backgroundHover,
    color: theme.colors.textPrimary,
  },
}))

export const Title = styled.h1(({ theme }) => ({
  margin: 0,
  fontSize: '24px',
  fontWeight: 600,
  color: theme.colors.textPrimary,
}))

export const HeaderActions = styled.div(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.sm,
  alignItems: 'center',
}))

export const DeleteButton = styled.button(({ theme }) => ({
  background: 'none',
  border: `1px solid ${theme.colors.border}`,
  cursor: 'pointer',
  padding: '8px',
  color: theme.colors.textSecondary,
  borderRadius: theme.borderRadius.md,
  transition: theme.transitions.normal,

  '&:hover': {
    color: theme.colors.danger,
    borderColor: theme.colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
}))

export const AddButton = styled.button(({ theme }) => ({
  padding: '10px 20px',
  background: theme.colors.primary,
  border: 'none',
  borderRadius: theme.borderRadius.md,
  color: theme.colors.white,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: theme.transitions.normal,

  '&:hover': {
    background: theme.colors.primaryHover,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${theme.colors.shadowMedium}`,
  },

  '&:active': {
    transform: 'translateY(0)',
  },
}))

export const EmptyStateContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '48px 32px',
  marginBottom: theme.spacing.lg,
  backgroundColor: theme.colors.backgroundHover,
  borderRadius: theme.borderRadius.lg,
  textAlign: 'center',
}))

export const EmptyStateIcon = styled.div(({ theme }) => ({
  fontSize: '48px',
  marginBottom: theme.spacing.md,
}))

export const EmptyStateImage = styled.img(({ theme }) => ({
  width: '200px',
  height: 'auto',
  marginBottom: '24px',
  borderRadius: theme.borderRadius.md,
}))

export const EmptyStateTitle = styled.h2(({ theme }) => ({
  margin: 0,
  fontSize: '20px',
  fontWeight: 600,
  color: theme.colors.textPrimary,
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',

  '& span': {
    color: theme.colors.success,
  },
}))

export const EmptyStateDescription = styled.p(({ theme }) => ({
  margin: 0,
  fontSize: '14px',
  color: theme.colors.textSecondary,
  textAlign: 'center',
  maxWidth: '600px',
  lineHeight: 1.6,
}))

export const EmptyStateLink = styled.span(({ theme }) => ({
  color: theme.colors.primary,
  textDecoration: 'none',
  fontWeight: 500,
  transition: theme.transitions.fast,
  cursor: 'pointer',

  '&:hover': {
    textDecoration: 'underline',
    color: theme.colors.primaryHover,
  },
}))

export const SearchContainer = styled.div({
  marginBottom: '24px',
  position: 'relative',
  maxWidth: '400px',
})

export const SearchIcon = styled.span(({ theme }) => ({
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: theme.colors.textSecondary,
  pointerEvents: 'none',
  zIndex: 1,
}))

export const SearchInputWrapper = styled.div({
  position: 'relative',
  '& input': {
    paddingLeft: '36px',
  },
})

export const CategoriesList = styled.div(({ theme }) => ({
  backgroundColor: theme.colors.background,
  borderRadius: theme.borderRadius.lg,
  border: `1px solid ${theme.colors.border}`,
  overflow: 'hidden',
}))

export const ListHeader = styled.div(({ theme }) => ({
  padding: theme.spacing.md,
  backgroundColor: theme.colors.backgroundHover,
  borderBottom: `1px solid ${theme.colors.border}`,
  fontWeight: 600,
  fontSize: '14px',
  color: theme.colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}))

export const CategoryRow = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing.md,
  borderBottom: `1px solid ${theme.colors.border}`,
  transition: theme.transitions.fast,

  '&:last-child': {
    borderBottom: 'none',
  },

  '&:hover': {
    backgroundColor: theme.colors.backgroundHover,
  },
}))

export const CategoryIcon = styled.span(({ theme }) => ({
  fontSize: '16px',
  marginRight: theme.spacing.md,
  display: 'flex',
  alignItems: 'center',
}))

export const CategoryName = styled.span(({ theme }) => ({
  flex: 1,
  fontSize: '14px',
  color: theme.colors.textPrimary,
}))

export const CategoryActions = styled.div(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.sm,
  alignItems: 'center',
}))

export const EditButton = styled.button(({ theme }) => ({
  background: 'none',
  border: `1px solid ${theme.colors.border}`,
  cursor: 'pointer',
  padding: '6px 12px',
  fontSize: '13px',
  color: theme.colors.accent,
  borderRadius: theme.borderRadius.sm,
  transition: theme.transitions.fast,

  '&:hover': {
    backgroundColor: theme.colors.accentBackground,
    borderColor: theme.colors.accent,
  },
}))

export const MoreButton = styled.button(({ theme }) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: theme.colors.textSecondary,
  fontSize: '20px',
  borderRadius: theme.borderRadius.sm,
  transition: theme.transitions.fast,

  '&:hover': {
    color: theme.colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
}))

export const LoadingContainer = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '64px',
  color: theme.colors.textSecondary,
  fontSize: '16px',
}))

export const ErrorContainer = styled.div(({ theme }) => ({
  padding: theme.spacing.md,
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  color: theme.colors.danger,
  borderRadius: theme.borderRadius.md,
  marginBottom: theme.spacing.md,
  textAlign: 'center',
}))
