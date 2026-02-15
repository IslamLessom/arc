import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { useEmployeesStatistics } from '@restaurant-pos/api-client'
import * as Styled from './styled'

export const StatisticsEmployees = () => {
  const [period, setPeriod] = useState<string>('today')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: statistics, error, isLoading } = useEmployeesStatistics({
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

  // Подготовка данных для графика эффективности по дням
  const chartData = statistics?.data?.daily_data?.map((item: any) => ({
    date: formatDate(item.date),
    orders: item.orders_handled,
    revenue: item.revenue,
    active: item.active_employees,
    fullDate: item.date
  })) || []

  // Подготовка данных для графика рейтинга сотрудников
  const performanceData = statistics?.data?.top_employees?.map((item: any) => ({
    name: item.employee_name.split(' ')[0], // Только имя
    fullName: item.employee_name,
    orders: item.orders_handled,
    revenue: item.revenue
  })) || []

  // Подготовка данных для таблицы топ сотрудников
  const topEmployees = statistics?.data?.top_employees || []

  const stats = statistics?.data

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.Header>
          <Styled.HeaderLeft>
            <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
            <Styled.Title>Статистика - Сотрудники</Styled.Title>
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
            <Styled.Title>Статистика - Сотрудники</Styled.Title>
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
          <Styled.Title>Статистика - Сотрудники</Styled.Title>
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
          <Styled.CardIcon>👨‍🍳</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Всего сотрудников</Styled.CardLabel>
            <Styled.CardValue>{stats?.total_employees || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>⏱️</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>На смене</Styled.CardLabel>
            <Styled.CardValue>{stats?.active_on_shift || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>💼</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Отработано часов</Styled.CardLabel>
            <Styled.CardValue>{stats?.total_hours_worked?.toFixed(1) || '0'}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>💰</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Начислено зарплаты</Styled.CardLabel>
            <Styled.CardValue>{formatCurrency(stats?.total_salary_paid)}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>
      </Styled.CardsGrid>

      <Styled.ContentGrid>
        <Styled.ChartSection>
          <Styled.SectionTitle>Динамика работы сотрудников</Styled.SectionTitle>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  dataKey="orders"
                  name="Заказы"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  strokeWidth={2}
                  yAxisId="left"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Выручка"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  yAxisId="right"
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
          <Styled.SectionTitle>Рейтинг сотрудников по выручке</Styled.SectionTitle>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} layout="horizontal">
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
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value?: number, name?: string) => {
                    if (name === 'revenue') {
                      return [formatCurrency(value), 'Выручка']
                    }
                    return [value, name]
                  }}
                  labelFormatter={(label: string) => {
                    const employee = performanceData.find((e: any) => e.name === label)
                    return employee?.fullName || label
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Styled.TablePlaceholder>
              <Styled.TableIcon>📋</Styled.TableIcon>
              <Styled.TableText>Нет данных о рейтинге сотрудников</Styled.TableText>
            </Styled.TablePlaceholder>
          )}
        </Styled.TableSection>
      </Styled.ContentGrid>

      <Styled.DetailsSection>
        <Styled.SectionTitle>Детализация по сотрудникам</Styled.SectionTitle>
        {topEmployees.length > 0 ? (
          <Styled.TableContainer>
            <Styled.Table>
              <Styled.TableHead>
                <Styled.TableRow>
                  <Styled.TableHeaderCell>Сотрудник</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Заказов</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Выручка</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Средний чек</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Часов</Styled.TableHeaderCell>
                </Styled.TableRow>
              </Styled.TableHead>
              <Styled.TableBody>
                {topEmployees.map((employee: any) => (
                  <Styled.TableRow key={employee.employee_id}>
                    <Styled.TableCell>{employee.employee_name}</Styled.TableCell>
                    <Styled.TableCell>{employee.orders_handled}</Styled.TableCell>
                    <Styled.TableCell>{formatCurrency(employee.revenue)}</Styled.TableCell>
                    <Styled.TableCell>{formatCurrency(employee.average_check)}</Styled.TableCell>
                    <Styled.TableCell>{employee.hours_worked.toFixed(1)}</Styled.TableCell>
                  </Styled.TableRow>
                ))}
              </Styled.TableBody>
            </Styled.Table>
          </Styled.TableContainer>
        ) : (
          <Styled.DetailsPlaceholder>
            <Styled.DetailsIcon>👨‍🍳</Styled.DetailsIcon>
            <Styled.DetailsText>Нет данных о сотрудниках</Styled.DetailsText>
          </Styled.DetailsPlaceholder>
        )}
      </Styled.DetailsSection>
    </Styled.PageContainer>
  )
}
