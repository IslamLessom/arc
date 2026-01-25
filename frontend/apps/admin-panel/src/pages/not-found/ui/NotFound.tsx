import { Button } from '@restaurant-pos/ui'
import { useNotFound } from '../hooks/useNotFound'
import * as Styled from './styled'

export const NotFound = () => {
  const { code, title, message, handleGoHome, handleGoBack } = useNotFound()

  return (
    <Styled.Container>
      <Styled.IllustrationContainer>
        <Styled.Circle size={120} color="#6366f1" />
        <Styled.Circle size={80} color="#818cf8" />
      </Styled.IllustrationContainer>

      <Styled.ErrorCode>{code}</Styled.ErrorCode>
      <Styled.Title>{title}</Styled.Title>
      <Styled.Message>{message}</Styled.Message>

      <Styled.ButtonGroup>
        <Button onClick={handleGoBack} variant="outline">
          Назад
        </Button>
        <Button onClick={handleGoHome} variant="default">
          На главную
        </Button>
      </Styled.ButtonGroup>
    </Styled.Container>
  )
}
