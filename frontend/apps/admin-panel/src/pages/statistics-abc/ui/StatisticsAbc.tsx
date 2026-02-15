import { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts'
import { useABCAnalysis } from '@restaurant-pos/api-client'
import * as Styled from './styled'

const COLORS = {
  A: '#10b981', // green
  B: '#f59e0b', // amber
  C: '#ef4444'  // red
}

export const StatisticsAbc = () => {
  const [period, setPeriod] = useState<string>('today')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const { data: statistics, error, isLoading } = useABCAnalysis({
    start_date: startDate,
    end_date: endDate
  })

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

  // Подготовка данных для круговой диаграммы
  const chartData = statistics?.data ? [
    {
      name: 'Группа A',
      value: statistics.data.group_a_revenue,
      products: statistics.data.group_a_products,
      color: COLORS.A
    },
    {
      name: 'Группа B',
      value: statistics.data.group_b_revenue,
      products: statistics.data.group_b_products,
      color: COLORS.B
    },
    {
      name: 'Группа C',
      value: statistics.data.group_c_revenue,
      products: statistics.data.group_c_products,
      color: COLORS.C
    }
  ].filter(d => d.value > 0) : []

  // Подготовка данных для таблицы по группам
  const groupData = statistics?.data ? [
    {
      group: 'A',
      products: statistics.data.group_a_products,
      revenue: statistics.data.group_a_revenue,
      color: COLORS.A
    },
    {
      group: 'B',
      products: statistics.data.group_b_products,
      revenue: statistics.data.group_b_revenue,
      color: COLORS.B
    },
    {
      group: 'C',
      products: statistics.data.group_c_products,
      revenue: statistics.data.group_c_revenue,
      color: COLORS.C
    }
  ] : []

  // Подготовка данных для полной таблицы товаров
  const productsData = statistics?.data?.products || []

  const totalRevenue = (statistics?.data?.group_a_revenue || 0) +
                      (statistics?.data?.group_b_revenue || 0) +
                      (statistics?.data?.group_c_revenue || 0)

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.Header>
          <Styled.HeaderLeft>
            <Styled.BackButton onClick={() => window.history.back()}>←</Styled.BackButton>
            <Styled.Title>ABC - Анализ</Styled.Title>
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
            <Styled.Title>ABC - Анализ</Styled.Title>
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
          <Styled.Title>ABC - Анализ</Styled.Title>
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
          <Styled.CardIcon>🅰️</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Группа A</Styled.CardLabel>
            <Styled.CardValue>{statistics?.data?.group_a_products || 0} товаров</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>🅱️</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Группа B</Styled.CardLabel>
            <Styled.CardValue>{statistics?.data?.group_b_products || 0} товаров</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>©️</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Группа C</Styled.CardLabel>
            <Styled.CardValue>{statistics?.data?.group_c_products || 0} товаров</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>

        <Styled.StatCard>
          <Styled.CardIcon>📊</Styled.CardIcon>
          <Styled.CardContent>
            <Styled.CardLabel>Всего товаров</Styled.CardLabel>
            <Styled.CardValue>{statistics?.data?.total_products || 0}</Styled.CardValue>
          </Styled.CardContent>
        </Styled.StatCard>
      </Styled.CardsGrid>

      <Styled.ContentGrid>
        <Styled.ChartSection>
          <Styled.SectionTitle>Распределение выручки по группам</Styled.SectionTitle>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.products}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Styled.ChartPlaceholder>
              <Styled.ChartIcon>📊</Styled.ChartIcon>
              <Styled.ChartText>Нет данных за выбранный период</Styled.ChartText>
            </Styled.ChartPlaceholder>
          )}
        </Styled.ChartSection>

        <Styled.TableSection>
          <Styled.SectionTitle>Детализация по группам</Styled.SectionTitle>
          {groupData.length > 0 && totalRevenue > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={groupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="group"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `Группа ${value}`}
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
                  formatter={(value: any, name: any) => {
                    if (name === 'revenue') {
                      return [formatCurrency(value as number), 'Выручка']
                    }
                    return [value, name]
                  }}
                  labelFormatter={(label: any) => `Группа ${label}`}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Styled.TablePlaceholder>
              <Styled.TableIcon>📋</Styled.TableIcon>
              <Styled.TableText>Нет данных о распределении по группам</Styled.TableText>
            </Styled.TablePlaceholder>
          )}
        </Styled.TableSection>
      </Styled.ContentGrid>

      <Styled.DetailsSection>
        <Styled.SectionTitle>Полный ABC-анализ по товарам</Styled.SectionTitle>
        {productsData.length > 0 ? (
          <Styled.TableContainer>
            <Styled.Table>
              <Styled.TableHead>
                <Styled.TableRow>
                  <Styled.TableHeaderCell>Группа</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Товар</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Выручка</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Кол-во</Styled.TableHeaderCell>
                  <Styled.TableHeaderCell>Вклад</Styled.TableHeaderCell>
                </Styled.TableRow>
              </Styled.TableHead>
              <Styled.TableBody>
                {productsData.map((product) => (
                  <Styled.TableRow key={product.product_id}>
                    <Styled.TableCell>
                      <Styled.GroupBadge $group={product.group}>
                        {product.group}
                      </Styled.GroupBadge>
                    </Styled.TableCell>
                    <Styled.TableCell>{product.product_name}</Styled.TableCell>
                    <Styled.TableCell>{formatCurrency(product.revenue)}</Styled.TableCell>
                    <Styled.TableCell>{product.quantity_sold}</Styled.TableCell>
                    <Styled.TableCell>{product.contribution.toFixed(1)}%</Styled.TableCell>
                  </Styled.TableRow>
                ))}
              </Styled.TableBody>
            </Styled.Table>
          </Styled.TableContainer>
        ) : (
          <Styled.DetailsPlaceholder>
            <Styled.DetailsIcon>📊</Styled.DetailsIcon>
            <Styled.DetailsText>Нет данных для анализа</Styled.DetailsText>
          </Styled.DetailsPlaceholder>
        )}
      </Styled.DetailsSection>
    </Styled.PageContainer>
  )
}
