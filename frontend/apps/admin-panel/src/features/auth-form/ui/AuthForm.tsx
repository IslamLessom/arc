import { useAuthForm } from '../hooks/useAuthForm';
import type { AuthFormProps } from '../model/types';
import { Button } from '@restaurant-pos/ui';
import * as Styled from './styled';

export const AuthForm = (props: AuthFormProps) => {
  const {
    email,
    password,
    isLoading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useAuthForm(props);

  return (
    <Styled.Form onSubmit={handleSubmit}>
      <Styled.InputGroup>
        <Styled.Label htmlFor="email">Email</Styled.Label>
        <Styled.Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          placeholder="Введите email"
          disabled={isLoading}
          required
        />
      </Styled.InputGroup>

      <Styled.InputGroup>
        <Styled.Label htmlFor="password">Пароль</Styled.Label>
        <Styled.Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          placeholder="Введите пароль"
          disabled={isLoading}
          required
        />
      </Styled.InputGroup>

      {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

      <Button htmlType="submit" disabled={isLoading}>
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
    </Styled.Form>
  );
};

