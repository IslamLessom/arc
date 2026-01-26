import styled from 'styled-components'

export const StyledEditButton = styled.button<{ $disabled?: boolean }>(({ $disabled }) => ({
  padding: '4px 12px',
  fontSize: '12px',
  fontWeight: '500',
  color: '#3b82f6',
  background: 'transparent',
  border: '1px solid #3b82f6',
  borderRadius: '4px',
  cursor: $disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s',

  '&:hover': !$disabled ? {
    background: '#3b82f6',
    color: 'white'
  } : {}
}))
