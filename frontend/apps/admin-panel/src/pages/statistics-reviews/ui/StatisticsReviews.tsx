import * as Styled from './styled'

export const StatisticsReviews = () => {
  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
          <Styled.Title>Статистика - Отзывы</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderActions>
          <Styled.ActionButton>
            <span>📊</span>
            Диаграммы
          </Styled.ActionButton>
          <Styled.ActionButton>
            <span>📤</span>
            Экспорт
          </Styled.ActionButton>
          <Styled.ActionButton>
            <span>🖨️</span>
            Печать
          </Styled.ActionButton>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.FilterContainer>
        <Styled.DateFilter>
          <Styled.FilterLabel>Период:</Styled.FilterLabel>
          <Styled.DateSelect>Сегодня</Styled.DateSelect>
          <Styled.DateSelect>Неделя</Styled.DateSelect>
          <Styled.DateSelect>Месяц</Styled.DateSelect>
          <Styled.DateSelect>Квартал</Styled.DateSelect>
          <Styled.DateSelect>Год</Styled.DateSelect>
        </Styled.DateFilter>
      </Styled.FilterContainer>

      <Styled.CardsGrid>
        <Styled.StatCard>
          <Styled.CardIcon>⭐</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Средняя оценка</Styled.CardLabel>
            <Styled.CardValue>0.0</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>💬</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Всего отзывов</Styled.CardLabel>
            <Styled.CardValue>0</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>👍</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Положительных</Styled.CardLabel>
            <Styled.CardValue>0</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>👎</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Отрицательных</Styled.CardLabel>
            <Styled.CardValue>0</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>
      </Styled.CardsGrid>

      <Styled.ContentGrid>
        <Styled.ChartSection>
          <Styled.SectionTitle>Распределение оценок</Styled.SectionTitle>
          <Styled.ChartPlaceholder>
            <Styled.ChartIcon>📊</Styled.ChartIcon>
            <Styled.ChartText>График распределения оценок</Styled.ChartText>
          </Styled.ChartPlaceholder>
        </Styled.ChartSection>

        <Styled.TableSection>
          <Styled.SectionTitle>Отзывы по категориям</Styled.SectionTitle>
          <Styled.TablePlaceholder>
            <Styled.TableIcon>📋</Styled.TableIcon>
            <Styled.TableText>Таблица отзывов по категориям</Styled.TableText>
          </Styled.TablePlaceholder>
        </Styled.TableSection>
      </Styled.ContentGrid>

      <Styled.DetailsSection>
        <Styled.SectionTitle>Детализация отзывов</Styled.SectionTitle>
        <Styled.DetailsPlaceholder>
          <Styled.DetailsIcon>💬</Styled.DetailsIcon>
          <Styled.DetailsText>Детальная информация об отзывах</Styled.DetailsText>
        </Styled.DetailsPlaceholder>
      </Styled.DetailsSection>
    </Styled.PageContainer>
  )
}
