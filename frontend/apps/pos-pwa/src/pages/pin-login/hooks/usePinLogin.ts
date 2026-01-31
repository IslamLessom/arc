import { useState, useCallback, useEffect } from 'react';
import type { UsePinLoginResult, PinLoginProps } from '../model/types';
import { PinLength } from '../model/enums';

export function usePinLogin(props: PinLoginProps): UsePinLoginResult {
  const { onPinComplete } = props;
  const [pin, setPin] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNumberClick = useCallback(
    (number: string) => {
      if (pin.length < PinLength.MAX && !isProcessing) {
        const newPin = pin + number;
        setPin(newPin);

        if (newPin.length === PinLength.MAX && onPinComplete) {
          setIsProcessing(true);
          onPinComplete(newPin).finally(() => {
            // Если авторизация не удалась, не сбрасываем PIN
            // Если успешна, страница изменится через navigate
            setIsProcessing(false);
          });
        }
      }
    },
    [pin, onPinComplete, isProcessing]
  );

  const handleDelete = useCallback(() => {
    if (!isProcessing) {
      setPin((prev) => prev.slice(0, -1));
    }
  }, [isProcessing]);

  const handleClear = useCallback(() => {
    if (!isProcessing) {
      setPin('');
    }
  }, [isProcessing]);

  return {
    pin,
    handleNumberClick,
    handleDelete,
    handleClear,
    isPinComplete: pin.length === PinLength.MAX,
  };
}
