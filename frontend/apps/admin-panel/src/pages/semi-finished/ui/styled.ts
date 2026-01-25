import styled from 'styled-components'

export const PageContainer = styled.div({
  padding: '2rem',
  maxWidth: '1400px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  minHeight: '100vh',
})

export const Header = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid #e5e7eb',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
})

export const BackButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  color: '#6b7280',
  '&:hover': {
    color: '#111827',
  },
})

export const Title = styled.h1({
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#111827',
})

export const HeaderActions = styled.div({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
})

export const DeleteButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  color: '#6b7280',
  '&:hover': {
    color: '#ef4444',
  },
})

export const EmptyStateContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '3rem 2rem',
  marginBottom: '2rem',
  backgroundColor: '#f9fafb',
  borderRadius: '0.5rem',
})

export const EmptyStateImage = styled.img({
  width: '200px',
  height: 'auto',
  marginBottom: '1.5rem',
  borderRadius: '0.5rem',
})

export const EmptyStateTitle = styled.h2({
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#111827',
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
})

export const EmptyStateDescription = styled.p({
  margin: 0,
  fontSize: '0.875rem',
  color: '#6b7280',
  textAlign: 'center',
  maxWidth: '600px',
  lineHeight: '1.5',
})

export const EmptyStateLink = styled.a({
  color: '#3b82f6',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
})

export const SearchContainer = styled.div({
  marginBottom: '1.5rem',
  position: 'relative',
  maxWidth: '400px',
})

export const SearchIcon = styled.span({
  position: 'absolute',
  left: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#6b7280',
  pointerEvents: 'none',
})

export const SearchInputWrapper = styled.div({
  position: 'relative',
  '& input': {
    paddingLeft: '2.5rem',
  },
})

export const SemiFinishedList = styled.div({
  backgroundColor: '#ffffff',
  borderRadius: '0.5rem',
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
})

export const ListHeader = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
  gap: '1rem',
  padding: '1rem',
  backgroundColor: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#374151',
})

export const SemiFinishedRow = styled.div({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
  gap: '1rem',
  alignItems: 'center',
  padding: '1rem',
  borderBottom: '1px solid #e5e7eb',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#f9fafb',
  },
})

export const SemiFinishedName = styled.span({
  fontSize: '0.875rem',
  color: '#111827',
  fontWeight: 500,
})

export const SemiFinishedCategory = styled.span({
  fontSize: '0.875rem',
  color: '#6b7280',
})

export const SemiFinishedUnit = styled.span({
  fontSize: '0.875rem',
  color: '#6b7280',
})

export const SemiFinishedQuantity = styled.span({
  fontSize: '0.875rem',
  color: '#111827',
})

export const SemiFinishedCost = styled.span({
  fontSize: '0.875rem',
  color: '#111827',
  fontWeight: 500,
})

export const SemiFinishedActions = styled.div({
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
})

export const EditButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  fontSize: '0.875rem',
  color: '#3b82f6',
  '&:hover': {
    textDecoration: 'underline',
  },
})

export const MoreButton = styled.button({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem',
  color: '#6b7280',
  fontSize: '1.25rem',
  '&:hover': {
    color: '#111827',
  },
})

export const LoadingContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4rem',
  color: '#6b7280',
})

export const ErrorContainer = styled.div({
  padding: '1rem',
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  borderRadius: '0.5rem',
  marginBottom: '1rem',
})