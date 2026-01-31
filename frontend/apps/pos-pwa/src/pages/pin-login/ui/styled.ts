import styled from 'styled-components';

export const PinLoginContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f0f0f0',
  padding: '20px',
  position: 'relative',
});

export const Header = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '60px',
});

export const Title = styled.h1({
  fontSize: '32px',
  fontWeight: 700,
  color: '#000000',
  margin: '0 0 8px 0',
  textAlign: 'center',
});

export const Subtitle = styled.p({
  fontSize: '16px',
  color: '#000000',
  margin: 0,
  textAlign: 'center',
});

export const PinIndicators = styled.div({
  display: 'flex',
  gap: '12px',
  marginBottom: '40px',
});

export const ErrorMessage = styled.p({
  fontSize: '14px',
  color: '#ff0000',
  margin: '0 0 20px 0',
  textAlign: 'center',
  minHeight: '20px',
});

export const PinIndicator = styled.div<{ filled: boolean }>((props) => ({
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  border: props.filled ? 'none' : '2px solid #d0d0d0',
  backgroundColor: props.filled ? '#000000' : 'transparent',
  transition: 'all 0.2s ease',
}));

export const Keypad = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  maxWidth: '300px',
  width: '100%',
  marginBottom: '40px',
});

export const KeypadButton = styled.button<{ variant?: 'delete' | 'clear' }>((props) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: props.variant === 'clear' ? '#4a4a4a' : '#ffffff',
  color: props.variant === 'clear' ? '#ffffff' : '#000000',
  fontSize: props.variant === 'delete' ? '14px' : '24px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  opacity: props.disabled ? 0.5 : 1,
  '&:active': {
    transform: 'scale(0.95)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  '&:hover': {
    backgroundColor: props.disabled
      ? props.variant === 'clear'
        ? '#4a4a4a'
        : '#ffffff'
      : props.variant === 'clear'
        ? '#5a5a5a'
        : '#f0f0f0',
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
}));

export const ClearButton = styled.button<{ disabled?: boolean }>((props) => ({
  width: '80px',
  height: '80px',
  borderRadius: '12px',
  border: 'none',
  backgroundColor: '#4a4a4a',
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  opacity: props.disabled ? 0.5 : 1,
  '&:active': {
    transform: 'scale(0.95)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  '&:hover': {
    backgroundColor: props.disabled ? '#4a4a4a' : '#5a5a5a',
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
}));

export const Footer = styled.div({
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const CompanyName = styled.p({
  fontSize: '14px',
  fontWeight: 600,
  color: '#000000',
  margin: 0,
});

export const EstablishmentInfo = styled.p({
  fontSize: '12px',
  color: '#666666',
  margin: 0,
});

export const ClientNumber = styled.p({
  fontSize: '12px',
  color: '#666666',
  margin: 0,
});

export const LogoutButton = styled.button({
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: '#ffffff',
  color: '#666666',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f0f0f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  svg: {
    fontSize: '20px',
  },
});

