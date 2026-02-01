import styled from 'styled-components';

export const ModalOverlay = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
});

export const ModalContent = styled.div({
  backgroundColor: '#FFFFFF',
  width: '90%',
  maxWidth: '420px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
});

export const ModalHeader = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #EEEEEE',
});

export const NavItem = styled.span({
  color: '#007BFF',
  fontSize: '14px',
  cursor: 'pointer',
  userSelect: 'none',
});

export const ModalTitle = styled.h2({
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: '#000000',
  textAlign: 'center',
  flex: 1,
});

export const CloseButton = styled.button({
  background: 'none',
  border: 'none',
  fontSize: '20px',
  color: '#999999',
  cursor: 'pointer',
  padding: 0,
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.3s',
  '&:hover': {
    color: '#666666',
  },
});

export const ModalBody = styled.div({
  padding: '20px',
});

export const InfoBlock = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '20px',
  backgroundColor: '#F8F9FA',
  padding: '12px',
  borderRadius: '8px',
});

export const FlagIcon = styled.span({
  fontSize: '16px',
  color: '#000000',
  flexShrink: 0,
});

export const InfoText = styled.p({
  margin: 0,
  fontSize: '14px',
  color: '#333333',
  lineHeight: '1.5',
});

export const InputWrapper = styled.div({
  marginBottom: '16px',
});

export const InputLabel = styled.label({
  display: 'block',
  fontSize: '14px',
  color: '#333333',
  marginBottom: '8px',
  fontWeight: 500,
});

export const CashInput = styled.input({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #CCCCCC',
  borderRadius: '4px',
  fontSize: '16px',
  color: '#333333',
  outline: 'none',
  transition: 'border-color 0.2s',
  '&::placeholder': {
    color: '#999999',
  },
  '&:focus': {
    borderColor: '#007BFF',
  },
  '&:disabled': {
    backgroundColor: '#F5F5F5',
    cursor: 'not-allowed',
  },
});

export const InputHint = styled.p({
  margin: '8px 0 0 0',
  fontSize: '12px',
  color: '#666666',
});

export const TimeInfo = styled.div({
  fontSize: '14px',
  color: '#666666',
  marginBottom: '20px',
});

export const ModalFooter = styled.div({
  padding: '0 20px 20px',
});

export const OpenButton = styled.button<{ disabled?: boolean }>((props) => ({
  width: '100%',
  backgroundColor: props.disabled ? '#CCCCCC' : '#28A745',
  color: '#FFFFFF',
  border: 'none',
  padding: '14px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  transition: 'background 0.3s',
  '&:hover': {
    backgroundColor: props.disabled ? '#CCCCCC' : '#218838',
  },
  '&:active': {
    backgroundColor: props.disabled ? '#CCCCCC' : '#1E7E34',
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
}));

export const ErrorMessage = styled.p({
  margin: '8px 0 0 0',
  fontSize: '14px',
  color: '#FF0000',
});
