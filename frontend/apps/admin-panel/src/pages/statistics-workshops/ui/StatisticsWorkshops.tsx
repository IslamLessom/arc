import * as Styled from './styled'

export const StatisticsWorkshops = () => {
  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
          <Styled.Title>Статистика - Цехи</Styled.Title>
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
          <Styled.CardIcon>🏭</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Всего цехов</Styled.CardLabel>
            <Styled.CardValue>0</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>🍽️</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Произведено блюд</Styled.CardLabel>
            <Styled.CardValue>0</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>⏱️</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Среднее время приготовления</Styled.CardLabel>
            <Styled.CardValue>0 мин</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>✅</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Выполнено заказов</Styled.CardLabel>
            <Styled.CardValue>0</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>
      </Styled.CardsGrid>

      <Styled.ContentGrid>
        <Styled.ChartSection>
          <Styled.SectionTitle>Загрузка цехов</Styled.SectionTitle>
          <Styled.ChartPlaceholder>
            <Styled.ChartIcon>📊</Styled.ChartIcon>
            <Styled.ChartText>График загрузки цехов</Styled.ChartText>
          </Styled.ChartPlaceholder>
        </Styled.ChartSection>

        <Styled.TableSection>
          <Styled.SectionTitle>Эффективность цехов</Styled.SectionTitle>
          <Styled.TablePlaceholder>
            <Styled.TableIcon>📋</Styled.TableIcon>
            <Styled.TableText>Таблица эффективности цехов</Styled.TableText>
          </Styled.TablePlaceholder>
        </Styled.TableSection>
      </Styled.ContentGrid>

      <Styled.DetailsSection>
        <Styled.SectionTitle>Детализация по цехам</Styled.SectionTitle>
        <Styled.DetailsPlaceholder>
          <Styled.DetailsIcon>🏭</Styled.DetailsIcon>
          <Styled.DetailsText>Детальная информация о цехах</Styled.DetailsText>
        </Styled.DetailsPlaceholder>
      </Styled.DetailsSection>
    </Styled.PageContainer>
  )
}
