export interface AuthFormProps {
  onSubmit?: (credentials: LoginCredentials) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UseAuthFormResult {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  handleEmailChange: (value: string) => void;
  handlePasswordChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

