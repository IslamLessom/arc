import styled from 'styled-components'

export const Container = styled.div({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 200px)',
  padding: '2rem',
  textAlign: 'center',
})

export const ErrorCode = styled.h1({
  fontSize: '120px',
  fontWeight: 700,
  lineHeight: 1,
  margin: 0,
  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #4f46e5 100%)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text' as const,
  animation: '$float 3s ease-in-out infinite',
})

export const Title = styled.h2({
  fontSize: '2rem',
  fontWeight: 600,
  margin: '1.5rem 0 1rem',
  color: '#f0f2f5',
})

export const Message = styled.p({
  fontSize: '1.125rem',
  color: '#a0a8b8',
  maxWidth: '500px',
  margin: '0 0 2rem',
  lineHeight: 1.6,
})

export const ButtonGroup = styled.div({
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap' as const,
  justifyContent: 'center',
})

export const IllustrationContainer = styled.div({
  position: 'relative' as const,
  marginBottom: '2rem',
})

export const Circle = styled.div(({ size = 120, color = '#6366f1' }: { size?: number, color?: string }) => ({
  position: 'absolute' as const,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color}40 0%, ${color}10 70%, transparent 100%)`,
  filter: 'blur(20px)',
  animation: '$pulse 4s ease-in-out infinite',
  ...(
    size === 120
      ? { width: '120px', height: '120px', top: '-40px', left: '-40px' }
      : { width: '80px', height: '80px', bottom: '-20px', right: '-20px' }
  ),
}))

export const styles = {
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' },
  },
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
    '50%': { opacity: 0.6, transform: 'scale(1.1)' },
  },
}
