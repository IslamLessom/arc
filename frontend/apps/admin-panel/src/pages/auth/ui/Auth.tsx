import { useState } from 'react';
import { AuthForm } from '../../../features/auth-form';
import { RegisterForm } from '../../../features/register-form';
import { useAuth } from '../hooks/useAuth';
import { Button, ButtonVariant } from '@restaurant-pos/ui';
import * as Styled from './styled';

export const Auth = () => {
  const { handleLogin, handleRegister } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleToggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
  };

  return (
    <Styled.AuthPageContainer>
      <Styled.AuthCard>
        {isRegisterMode ? (
          <>
            <Styled.Title>Регистрация</Styled.Title>
            <Styled.Subtitle>Создайте новый аккаунт</Styled.Subtitle>
            <RegisterForm onSubmit={handleRegister} />
            <Styled.SwitchModeContainer>
              <Styled.SwitchModeText>Уже есть аккаунт?</Styled.SwitchModeText>
              <Button variant={ButtonVariant.Link} onClick={handleToggleMode}>
                Войти
              </Button>
            </Styled.SwitchModeContainer>
          </>
        ) : (
          <>
            <Styled.Title>Вход в систему</Styled.Title>
            <Styled.Subtitle>Введите свои учетные данные для входа</Styled.Subtitle>
            <AuthForm onSubmit={handleLogin} />
            <Styled.SwitchModeContainer>
              <Styled.SwitchModeText>Нет аккаунта?</Styled.SwitchModeText>
              <Button variant={ButtonVariant.Link} onClick={handleToggleMode}>
                Зарегистрироваться
              </Button>
            </Styled.SwitchModeContainer>
          </>
        )}
      </Styled.AuthCard>
    </Styled.AuthPageContainer>
  );
};

