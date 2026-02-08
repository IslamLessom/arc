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
  maxHeight: '60vh',
  overflowY: 'auto',
});

export const ModalFooter = styled.div({
  padding: '0 20px 20px',
  display: 'flex',
  gap: '10px',
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

export const InfoIcon = styled.span({
  fontSize: '16px',
  flexShrink: 0,
});

export const InfoText = styled.p({
  margin: 0,
  fontSize: '14px',
  color: '#333333',
  lineHeight: '1.5',
});

export const ShiftInfo = styled.div({
  marginBottom: '20px',
  padding: '12px',
  backgroundColor: '#F0F7FF',
  borderRadius: '8px',
});

export const ShiftInfoItem = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
  '&:last-child': {
    marginBottom: 0,
  },
});

export const ShiftInfoLabel = styled.span({
  fontSize: '14px',
  color: '#666666',
});

export const ShiftInfoValue = styled.span({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333333',
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

export const Select = styled.select({
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #CCCCCC',
  borderRadius: '4px',
  fontSize: '16px',
  color: '#333333',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: '#FFFFFF',
  '&:focus': {
    borderColor: '#007BFF',
  },
  '&:disabled': {
    backgroundColor: '#F5F5F5',
    cursor: 'not-allowed',
  },
});

export const ErrorMessage = styled.p({
  margin: '8px 0 0 0',
  fontSize: '14px',
  color: '#FF0000',
});

export const HelperText = styled.p({
  margin: '4px 0 0 0',
  fontSize: '12px',
  color: '#666666',
});

export const LoadingText = styled.p({
  textAlign: 'center',
  color: '#666666',
  margin: '20px 0',
});

export const NoShiftMessage = styled.p({
  textAlign: 'center',
  color: '#666666',
  margin: '20px 0',
});

export const ShiftStats = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const ShiftStatsHeader = styled.h3({
  margin: '0 0 8px 0',
  fontSize: '16px',
  fontWeight: 600,
  color: '#333333',
});

export const StatRow = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const StatLabel = styled.span({
  fontSize: '14px',
  color: '#666666',
});

export const StatValue = styled.span({
  fontSize: '14px',
  fontWeight: 600,
  color: '#333333',
});

export const StatDivider = styled.div({
  height: '1px',
  backgroundColor: '#EEEEEE',
  margin: '4px 0',
});

export const CancelButton = styled.button({
  flex: 1,
  backgroundColor: '#FFFFFF',
  color: '#333333',
  border: '1px solid #CCCCCC',
  padding: '14px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.3s, border 0.3s',
  '&:hover': {
    backgroundColor: '#F5F5F5',
    borderColor: '#BBBBBB',
  },
});

export const EndButton = styled.button<{ disabled?: boolean }>((props) => ({
  flex: 1,
  backgroundColor: props.disabled ? '#CCCCCC' : '#DC3545',
  color: '#FFFFFF',
  border: 'none',
  padding: '14px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  transition: 'background 0.3s',
  '&:hover': {
    backgroundColor: props.disabled ? '#CCCCCC' : '#C82333',
  },
  '&:active': {
    backgroundColor: props.disabled ? '#CCCCCC' : '#BD2130',
  },
}));

export const RecountButton = styled.button({
  flex: 1,
  backgroundColor: '#FFC107',
  color: '#333333',
  border: 'none',
  padding: '14px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.3s',
  '&:hover': {
    backgroundColor: '#E0A800',
  },
  '&:active': {
    backgroundColor: '#D39E00',
  },
});
