export interface PinLoginProps {
  onPinComplete?: (pin: string) => void | Promise<void>;
}

export interface UsePinLoginResult {
  pin: string;
  handleNumberClick: (number: string) => void;
  handleDelete: () => void;
  handleClear: () => void;
  isPinComplete: boolean;
}

