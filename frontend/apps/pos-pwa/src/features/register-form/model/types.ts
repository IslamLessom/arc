export interface RegisterFormProps {
  onSubmit?: (data: RegisterCredentials) => void;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface UseRegisterFormResult {
  email: string;
  password: string;
  name: string;
  isLoading: boolean;
  error: string | null;
  handleEmailChange: (value: string) => void;
  handlePasswordChange: (value: string) => void;
  handleNameChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}
