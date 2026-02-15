import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useSalesStatistics } from '@restaurant-pos/api-client'
import * as Styled from './styled'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export const StatisticsSales = () => {
  const [period, setPeriod] = useState<string>('today')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: statistics, error, isLoading } = useSalesStatistics({
    start_date: startDate,
    end_date: endDate
  })

  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  // Форматирование валюты
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '0 ₽'
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

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

    const formattedStartDate = start.toISOString().split('T')[0]
    const formattedEndDate = new Date().toISOString().split('T')[0]
    setStartDate(formattedStartDate)
    setEndDate(formattedEndDate)
  }

  // Инициализация периода при первом рендере
  useEffect(() => {
    handlePeriodChange('today')
  }, [])

  // Подготовка данных для графика динамики продаж
  const chartData = statistics?.data?.daily_data?.map((item) => ({
    date: formatDate(item.date),
    revenue: item.revenue,
    orders: item.orders,
    fullDate: item.date
  })) || []

  // Подготовка данных для графика по категориям
  const categoryData = statistics?.data?.revenue_by_category?.map((item) => ({
    name: item.category_name,
    value: item.revenue,
    orders: item.orders_count,
    percentage: item.percentage
  })) || []

  // Подготовка данных для графика по методам оплаты
  const paymentData = statistics?.data?.revenue_by_payment_method ? [
    { name: 'Наличные', value: statistics.data.revenue_by_payment_method.cash },
    { name: 'Карта', value: statistics.data.revenue_by_payment_method.card },
    { name: 'Онлайн', value: statistics.data.revenue_by_payment_method.online }
  ].filter(item => item.value > 0) : []

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
              {(stats?.average_order_value || stats?.average_order)?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) || '0 ₽'}
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
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value?: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Дата: ${label}`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Выручка"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Styled.ChartPlaceholder>
              <Styled.ChartIcon>📊</Styled.ChartIcon>
              <Styled.ChartText>Нет данных за выбранный период</Styled.ChartText>
            </Styled.ChartPlaceholder>
          )}
        </Styled.ChartSection>

        <Styled.TableSection>
          <Styled.SectionTitle>Продажи по категориям</Styled.SectionTitle>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value?: number) => formatCurrency(value)}
                />
                <Bar
                  dataKey="value"
                  fill="#3b82f6"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Styled.TablePlaceholder>
              <Styled.TableIcon>📋</Styled.TableIcon>
              <Styled.TableText>Нет данных по категориям</Styled.TableText>
            </Styled.TablePlaceholder>
          )}
        </Styled.TableSection>
      </Styled.ContentGrid>

      <Styled.ContentGrid>
        <Styled.ChartSection>
          <Styled.SectionTitle>Распределение по методам оплаты</Styled.SectionTitle>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, payload }) => {
                    const total = paymentData.reduce((acc, item) => acc + item.value, 0)
                    const percent = total > 0 ? ((payload?.value || 0) / total * 100).toFixed(1) : '0'
                    return `${name}: ${percent}%`
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value?: number) => formatCurrency(value)}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Styled.ChartPlaceholder>
              <Styled.ChartIcon>💳</Styled.ChartIcon>
              <Styled.ChartText>Нет данных по методам оплаты</Styled.ChartText>
            </Styled.ChartPlaceholder>
          )}
        </Styled.ChartSection>

        <Styled.TableSection>
          <Styled.SectionTitle>Количество заказов по дням</Styled.SectionTitle>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value?: number) => [value, 'Заказы']}
                  labelFormatter={(label) => `Дата: ${label}`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="orders"
                  name="Заказы"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Styled.TablePlaceholder>
              <Styled.TableIcon>📋</Styled.TableIcon>
              <Styled.ChartText>Нет данных о заказах</Styled.ChartText>
            </Styled.TablePlaceholder>
          )}
        </Styled.TableSection>
      </Styled.ContentGrid>
    </Styled.PageContainer>
  )
}
