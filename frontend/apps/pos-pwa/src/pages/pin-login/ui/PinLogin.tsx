import { useState } from 'react';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePinLogin } from '../hooks/usePinLogin';
import { usePinLoginAuth } from '../hooks/usePinLoginAuth';
import { useLogoutWithShiftEnd } from '../hooks/useLogoutWithShiftEnd';
import { PinLength } from '../model/enums';
import { ShiftStartModal } from '../../../features/shift-start-modal';
import * as Styled from './styled';

export const PinLogin = () => {
  const navigate = useNavigate();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const { mutate: pinLoginMutation, isLoading, error } = usePinLoginAuth({
    onNoActiveShift: () => {
      setIsShiftModalOpen(true);
    },
  });
  const { handleLogout, isEndingShift } = useLogoutWithShiftEnd();

  const { pin, handleNumberClick, handleDelete, handleClear } = usePinLogin({
    onPinComplete: async (pin: string) => {
      await pinLoginMutation(pin);
    },
  });

  const handleShiftModalClose = () => {
    setIsShiftModalOpen(false);
  };

  const handleShiftModalSuccess = () => {
    setIsShiftModalOpen(false);
    navigate('/');
  };

  const renderPinIndicators = () => {
    return Array.from({ length: PinLength.MAX }, (_, index) => (
      <Styled.PinIndicator key={index} filled={index < pin.length} />
    ));
  };

  const renderKeypad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return (
      <>
        {numbers.map((num) => (
          <Styled.KeypadButton
            key={num}
            onClick={() => handleNumberClick(num)}
            disabled={isLoading}
          >
            {num}
          </Styled.KeypadButton>
        ))}
        <Styled.KeypadButton variant="delete" onClick={handleDelete} disabled={isLoading}>
          Удалить
        </Styled.KeypadButton>
        <Styled.KeypadButton onClick={() => handleNumberClick('0')} disabled={isLoading}>
          0
        </Styled.KeypadButton>
        <Styled.ClearButton onClick={handleClear} disabled={isLoading}>
          ✕
        </Styled.ClearButton>
      </>
    );
  };

  return (
    <Styled.PinLoginContainer>
      <Styled.Header>
        <Styled.Title>ARCE</Styled.Title>
        <Styled.Subtitle>Больше, чем просто касса</Styled.Subtitle>
      </Styled.Header>

      <Styled.PinIndicators>{renderPinIndicators()}</Styled.PinIndicators>

      {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

      <Styled.Keypad>{renderKeypad()}</Styled.Keypad>

      <Styled.Footer>
        <Styled.CompanyName>Ebari</Styled.CompanyName>
        <Styled.EstablishmentInfo>Касса в «Ebari»</Styled.EstablishmentInfo>
        <Styled.ClientNumber>Клиентский номер: 590518</Styled.ClientNumber>
      </Styled.Footer>

      <Styled.LogoutButton onClick={handleLogout} title="Выход" disabled={isEndingShift}>
        <LogoutOutlined />
      </Styled.LogoutButton>

      <ShiftStartModal
        isOpen={isShiftModalOpen}
        onClose={handleShiftModalClose}
        onSuccess={handleShiftModalSuccess}
      />
    </Styled.PinLoginContainer>
  );
};
