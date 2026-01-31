import { useNavigate } from 'react-router-dom'
import { Button, ButtonVariant } from '@restaurant-pos/ui'
import * as Styled from './styled'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <Styled.Container>
      <Styled.Content>
        <Styled.Title>404</Styled.Title>
        <Styled.Subtitle>Страница не найдена</Styled.Subtitle>
        <Styled.Description>
          К сожалению, страница, которую вы ищете, не существует или была перемещена.
        </Styled.Description>
        <Button variant={ButtonVariant.Primary} onClick={() => navigate('/')}>
          На главную
        </Button>
      </Styled.Content>
    </Styled.Container>
  )
}
