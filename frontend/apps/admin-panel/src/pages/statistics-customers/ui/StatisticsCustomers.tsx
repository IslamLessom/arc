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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { useCustomerStatistics } from '@restaurant-pos/api-client'
import * as Styled from './styled'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export const StatisticsCustomers = () => {
  const [period, setPeriod] = useState<string>('today')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: statistics, error, isLoading } = useCustomerStatistics({
    start_date: startDate,
    end_date: endDate
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

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

  useEffect(() => {
    handlePeriodChange('today')
  }, [])

  // Подготовка данных для графика динамики клиентов
  const chartData = statistics?.data?.daily_data?.map((item) => ({
    date: formatDate(item.date),
    new: item.new_customers,
    returning: item.returning_count,
    fullDate: item.date
  })) || []

  // Подготовка данных для графика по сегментам
  const segmentData = statistics?.data ? [
    { name: 'Новые клиенты', value: statistics.data.new_customers, color: '#10b981' },
    { name: 'Постоянные клиенты', value: statistics.data.returning_customers, color: '#3b82f6' },
    { name: 'VIP клиенты', value: statistics.data.vip_customers, color: '#f59e0b' }
  ].filter(item => item.value > 0) : []

  // Подготовка данных для таблицы топ клиентов
  const topCustomers = statistics?.data?.top_customers || []

  const stats = statistics?.data

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.Header>
          <Styled.HeaderLeft>
            <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
            <Styled.Title>Статистика - Клиенты</Styled.Title>
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
            <Styled.Title>Статистика - Клиенты</Styled.Title>
          </Styled.HeaderLeft>
        </Styled.Header>
        <div>Ошибка загрузки данных</div>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
          <Styled.Title>Статистика - Клиенты</Styled.Title>
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
          <Styled.CardIcon>👥</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Всего клиентов</Styled.CardLabel>
            <Styled.CardValue>{stats?.total_customers || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>🆕</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Новых клиентов</Styled.CardLabel>
            <Styled.CardValue>{stats?.new_customers || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>🔄</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Постоянные клиенты</Styled.CardLabel>
            <Styled.CardValue>{stats?.returning_customers || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>⭐</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>VIP клиенты</Styled.CardLabel>
            <Styled.CardValue>{stats?.vip_customers || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>
      </Styled.CardsGrid>

      <Styled.ContentGrid>
        <Styled.ChartSection>
          <Styled.SectionTitle>Динамика клиентов</Styled.SectionTitle>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(label) => `Дата: ${label}`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="new"
                  name="Новые клиенты"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorNew)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="returning"
                  name="Постоянные клиенты"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorReturning)"
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
          <Styled.SectionTitle>Клиенты по сегментам</Styled.SectionTitle>
          {segmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, payload }) => {
                    const total = segmentData.reduce((acc, item) => acc + item.value, 0)
                    const percent = total > 0 ? ((payload?.value || 0) / total * 100).toFixed(1) : '0'
                    return `${name}: ${percent}%`
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value?: number) => [value, 'Клиентов']}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Styled.TablePlaceholder>
              <Styled.TableIcon>📋</Styled.TableIcon>
              <Styled.TableText>Нет данных по сегментам</Styled.TableText>
            </Styled.TablePlaceholder>
          )}
        </Styled.TableSection>
      </Styled.ContentGrid>

      <Styled.DetailsSection>
        <Styled.SectionTitle>Топ клиентов по выручке</Styled.SectionTitle>
        {topCustomers.length > 0 ? (
          <Styled.TableContainer>
            <Styled.Table>
              <Styled.TableHead>
                <Styled.TableRow>
                  <Styled.TableHeaderCell>Клиент</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Заказов</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Выручка</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Средний чек</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Последний визит</Styled.TableHeaderCell>
                </Styled.TableRow>
              </Styled.TableHead>
              <Styled.TableBody>
                {topCustomers.map((customer) => (
                  <Styled.TableRow key={customer.customer_id}>
                    <Styled.TableCell>{customer.customer_name}</Styled.TableCell>
                    <Styled.TableCell>{customer.total_orders}</Styled.TableCell>
                    <Styled.TableCell>{formatCurrency(customer.total_revenue)}</Styled.TableCell>
                    <Styled.TableCell>{formatCurrency(customer.average_check)}</Styled.TableCell>
                    <Styled.TableCell>{formatDate(customer.last_visit)}</Styled.TableCell>
                  </Styled.TableRow>
                ))}
              </Styled.TableBody>
            </Styled.Table>
          </Styled.TableContainer>
        ) : (
          <Styled.DetailsPlaceholder>
            <Styled.DetailsIcon>👥</Styled.DetailsIcon>
            <Styled.DetailsText>Нет данных о клиентах</Styled.DetailsText>
          </Styled.DetailsPlaceholder>
        )}
      </Styled.DetailsSection>
    </Styled.PageContainer>
  )
}
