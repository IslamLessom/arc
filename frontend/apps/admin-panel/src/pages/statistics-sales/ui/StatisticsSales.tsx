import { useState } from 'react'
import { useSalesStatistics } from '@restaurant-pos/api-client'
import * as Styled from './styled'

export const StatisticsSales = () => {
  const [period, setPeriod] = useState<string>('today')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: statistics, error, isLoading } = useSalesStatistics({
    start_date: startDate,
    end_date: endDate
  })

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    const now = new Date()
    let start = new Date()

    switch (newPeriod) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'quarter':
        start = new Date(now.setMonth(now.getMonth() - 3))
        break
      case 'year':
        start = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
  }

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.Header>
          <Styled.HeaderLeft>
            <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
            <Styled.Title>Статистика - Продажи</Styled.Title>
          </Styled.HeaderLeft>
        </Styled.Header>
        <div>Загрузка...</div>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.Header>
          <Styled.HeaderLeft>
            <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
            <Styled.Title>Статистика - Продажи</Styled.Title>
          </Styled.HeaderLeft>
        </Styled.Header>
        <div>Ошибка загрузки данных</div>
      </Styled.PageContainer>
    )
  }

  const stats = statistics?.data

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
          <Styled.Title>Статистика - Продажи</Styled.Title>
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
          <Styled.DateSelect
            active={period === 'today'}
            onClick={() => handlePeriodChange('today')}
          >
            Сегодня
          </Styled.DateSelect>
          <Styled.DateSelect
            active={period === 'week'}
            onClick={() => handlePeriodChange('week')}
          >
            Неделя
          </Styled.DateSelect>
          <Styled.DateSelect
            active={period === 'month'}
            onClick={() => handlePeriodChange('month')}
          >
            Месяц
          </Styled.DateSelect>
          <Styled.DateSelect
            active={period === 'quarter'}
            onClick={() => handlePeriodChange('quarter')}
          >
            Квартал
          </Styled.DateSelect>
          <Styled.DateSelect
            active={period === 'year'}
            onClick={() => handlePeriodChange('year')}
          >
            Год
          </Styled.DateSelect>
        </Styled.DateFilter>
      </Styled.FilterContainer>

      <Styled.CardsGrid>
        <Styled.StatCard>
          <Styled.CardIcon>💰</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Общая выручка</Styled.CardLabel>
            <Styled.CardValue>
              {stats?.total_revenue?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) || '0 ₽'}
            </Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>🧾</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Количество чеков</Styled.CardLabel>
            <Styled.CardValue>{stats?.total_orders || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>📈</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Средний чек</Styled.CardLabel>
            <Styled.CardValue>
              {stats?.average_order_value?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) || '0 ₽'}
            </Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>👥</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Количество гостей</Styled.CardLabel>
            <Styled.CardValue>{stats?.total_guests || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>
      </Styled.CardsGrid>

      <Styled.ContentGrid>
        <Styled.ChartSection>
          <Styled.SectionTitle>Динамика продаж</Styled.SectionTitle>
          <Styled.ChartPlaceholder>
            <Styled.ChartIcon>📊</Styled.ChartIcon>
            <Styled.ChartText>График динамики продаж</Styled.ChartText>
          </Styled.ChartPlaceholder>
        </Styled.ChartSection>

        <Styled.TableSection>
          <Styled.SectionTitle>Продажи по категориям</Styled.SectionTitle>
          <Styled.TablePlaceholder>
            <Styled.TableIcon>📋</Styled.TableIcon>
            <Styled.TableText>Таблица продаж по категориям</Styled.TableText>
          </Styled.TablePlaceholder>
        </Styled.TableSection>
      </Styled.ContentGrid>

      <Styled.DetailsSection>
        <Styled.SectionTitle>Детализация продаж</Styled.SectionTitle>
        <Styled.DetailsPlaceholder>
          <Styled.DetailsIcon>📊</Styled.DetailsIcon>
          <Styled.DetailsText>Детальная информация о продажах</Styled.DetailsText>
        </Styled.DetailsPlaceholder>
      </Styled.DetailsSection>
    </Styled.PageContainer>
  )
}
