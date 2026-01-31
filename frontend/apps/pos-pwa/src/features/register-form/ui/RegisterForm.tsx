import { useRegisterForm } from '../hooks/useRegisterForm';
import type { RegisterFormProps } from '../model/types';
import { Button } from '@restaurant-pos/ui';
import * as Styled from './styled';

export const RegisterForm = (props: RegisterFormProps) => {
  const {
    email,
    password,
    name,
    isLoading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleNameChange,
    handleSubmit,
  } = useRegisterForm(props);

  return (
    <Styled.Form onSubmit={handleSubmit}>
      <Styled.InputGroup>
        <Styled.Label htmlFor="name">Имя</Styled.Label>
        <Styled.Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Введите имя"
          disabled={isLoading}
          required
        />
      </Styled.InputGroup>

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
          placeholder="Введите пароль (минимум 6 символов)"
          disabled={isLoading}
          required
          minLength={6}
        />
      </Styled.InputGroup>

      {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

      <Button htmlType="submit" disabled={isLoading}>
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </Styled.Form>
  );
};
