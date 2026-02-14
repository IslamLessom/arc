import styled from 'styled-components'

export const StyledDeleteButton = styled.button<{ $disabled?: boolean }>(({ $disabled }) => ({
  padding: '4px 12px',
  fontSize: '12px',
  fontWeight: '500',
  color: '#ef4444',
  background: 'transparent',
  border: '1px solid #ef4444',
  borderRadius: '4px',
  cursor: $disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s',

  '&:hover': !$disabled ? {
    background: '#ef4444',
    color: 'white'
  } : {}
}))
