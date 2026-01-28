import { useEffect } from 'react'
import { Alert } from 'antd'
import { useInventoryDetail } from '../hooks/useInventoryDetail'
import { formatNumber, formatCurrency, getDifferenceColor } from '../lib/utils'
import * as Styled from './styled'

export const InventoryDetail = () => {
  const {
    formData,
    isLoading,
    isSaving,
    error,
    activeTab,
    searchQuery,
    filteredItems,
    stats,
    isReadOnly,
    canComplete,
    canReopen,
    statusLabel,
    statusColor,
    completionAttempted,
    validationErrors,
    setActiveTab,
    setSearchQuery,
    handleQuantityChange,
    handleBlurQuantity,
    handleBack,
    handleComplete,
    handleReopen,
    handleSave,
    handleCommentChange,
  } = useInventoryDetail()

  // Auto-save on changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.inventory_id && !isReadOnly && !isLoading && formData.items && formData.items.length > 0) {
        handleSave().catch((err) => {
          console.error('Auto-save failed:', err)
        })
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData.items, formData.comment, isReadOnly, isLoading, formData.inventory_id, handleSave])

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.LoadingContainer>Загрузка инвентаризации...</Styled.LoadingContainer>
      </Styled.PageContainer>
    )
  }

  if (error && !formData.inventory_id) {
    return (
      <Styled.PageContainer>
        <Styled.ErrorContainer>Ошибка при загрузке инвентаризации: {error}</Styled.ErrorContainer>
      </Styled.PageContainer>
    )
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.BackButton onClick={handleBack} aria-label="Назад">
            ←
          </Styled.BackButton>
          <div>
            <Styled.HeaderTitle>Инвентаризация #{formData.inventory_id?.slice(0, 8)}</Styled.HeaderTitle>
            <Styled.HeaderSubtitle>
              <Styled.StatusBadge $color={statusColor}>{statusLabel}</Styled.StatusBadge>
              <span>•</span>
              <span>{formData.warehouse_name}</span>
              <span>•</span>
              <span>{formData.type === 'full' ? 'Полная' : 'Частичная'}</span>
            </Styled.HeaderSubtitle>
          </div>
        </Styled.HeaderLeft>

        <Styled.HeaderActions>
          {canReopen && (
            <Styled.ActionButton
              $variant="outline"
              onClick={handleReopen}
              disabled={isSaving}
            >
              Открыть для редактирования
            </Styled.ActionButton>
          )}
          {canComplete && (
            <Styled.ActionButton
              $variant="primary"
              onClick={handleComplete}
              disabled={isSaving || isReadOnly}
            >
              Провести инвентаризацию
            </Styled.ActionButton>
          )}
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.Content>
        {completionAttempted && validationErrors.size > 0 && (
          <Styled.ValidationAlert>
            <Styled.ValidationIcon>⚠️</Styled.ValidationIcon>
            <Styled.ValidationText>
              Заполните все поля перед завершением инвентаризации (осталось: {validationErrors.size})
            </Styled.ValidationText>
          </Styled.ValidationAlert>
        )}

        {error && (
          <Alert
            message="Ошибка"
            description={error}
            type="error"
            closable
            style={{ marginBottom: '16px' }}
          />
        )}

        <Styled.InfoSection>
          <Styled.InfoBlock>
            <Styled.InfoLabel>Склад</Styled.InfoLabel>
            <Styled.InfoValue>{formData.warehouse_name || '—'}</Styled.InfoValue>
          </Styled.InfoBlock>
          <Styled.InfoBlock>
            <Styled.InfoLabel>Тип</Styled.InfoLabel>
            <Styled.InfoValue>{formData.type === 'full' ? 'Полная' : 'Частичная'}</Styled.InfoValue>
          </Styled.InfoBlock>
          <Styled.InfoBlock>
            <Styled.InfoLabel>Дата и время</Styled.InfoLabel>
            <Styled.InfoValue>
              {formatDateTime(formData.actual_date || formData.scheduled_date)}
            </Styled.InfoValue>
          </Styled.InfoBlock>
          <Styled.InfoBlock>
            <Styled.InfoLabel>Статус</Styled.InfoLabel>
            <Styled.InfoValue>
              <Styled.StatusBadge $color={statusColor}>{statusLabel}</Styled.StatusBadge>
            </Styled.InfoValue>
          </Styled.InfoBlock>
        </Styled.InfoSection>

        <Styled.CommentSection style={{ marginBottom: '16px' }}>
          <Styled.InfoLabel>Комментарий</Styled.InfoLabel>
          <Styled.CommentTextarea
            value={formData.comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            disabled={isReadOnly}
            placeholder="Добавьте комментарий к инвентаризации..."
          />
        </Styled.CommentSection>

        <Styled.TabsContainer>
          <Styled.TabButton
            $active={activeTab === 'ingredients'}
            onClick={() => setActiveTab('ingredients')}
          >
            Ингредиенты и товары
          </Styled.TabButton>
          <Styled.TabButton
            $active={activeTab === 'tech_cards'}
            onClick={() => setActiveTab('tech_cards')}
          >
            Техкарты и полуфабрикаты
          </Styled.TabButton>
        </Styled.TabsContainer>

        <Styled.TableContainer>
          <Styled.Table>
            <Styled.TableHead>
              <Styled.TableRow>
                <Styled.TableCell style={{ width: '30%' }}>Наименование</Styled.TableCell>
                <Styled.TableCell style={{ width: '12%', textAlign: 'right' }}>План</Styled.TableCell>
                <Styled.TableCell style={{ width: '12%', textAlign: 'right' }}>Поступления</Styled.TableCell>
                <Styled.TableCell style={{ width: '12%', textAlign: 'right' }}>Расход</Styled.TableCell>
                <Styled.TableCell style={{ width: '12%', textAlign: 'right' }}>Факт</Styled.TableCell>
                <Styled.TableCell style={{ width: '10%', textAlign: 'right' }}>Разница</Styled.TableCell>
                <Styled.TableCell style={{ width: '12%', textAlign: 'right' }}>Сумма</Styled.TableCell>
              </Styled.TableRow>
            </Styled.TableHead>
            <tbody>
              {filteredItems.map((item) => {
                const differenceColor = getDifferenceColor(item.difference)
                return (
                  <Styled.TableRow key={item.id}>
                    <Styled.TableDataCell>
                      <div>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {item.type === 'ingredient' && 'Ингредиент'}
                        {item.type === 'product' && 'Товар'}
                        {item.type === 'tech_card' && 'Тех. карта'}
                        {item.type === 'semi_finished' && 'Полуфабрикат'}
                      </div>
                    </Styled.TableDataCell>
                    <Styled.TableDataCell $align="right">
                      {formatNumber(item.planned_quantity)} {item.unit}
                    </Styled.TableDataCell>
                    <Styled.TableDataCell $align="right">
                      {formatNumber(item.income_quantity)} {item.unit}
                    </Styled.TableDataCell>
                    <Styled.TableDataCell $align="right">
                      {formatNumber(item.expense_quantity)} {item.unit}
                    </Styled.TableDataCell>
                    <Styled.TableDataCell $align="right">
                      <Styled.QuantityInput
                        type="text"
                        value={item.actual_quantity.toString()}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        onBlur={() => handleBlurQuantity(item.id)}
                        disabled={isReadOnly}
                        placeholder="0"
                        $hasError={
                          completionAttempted && validationErrors.has(item.id)
                        }
                      />
                    </Styled.TableDataCell>
                    <Styled.TableDataCell $align="right">
                      <Styled.DifferenceValue $color={differenceColor}>
                        {item.difference > 0 ? '+' : ''}
                        {formatNumber(item.difference)} {item.unit}
                      </Styled.DifferenceValue>
                    </Styled.TableDataCell>
                    <Styled.TableDataCell $align="right">
                      <Styled.DifferenceValue $color={differenceColor}>
                        {item.difference_value > 0 ? '+' : ''}
                        {formatCurrency(item.difference_value)}
                      </Styled.DifferenceValue>
                    </Styled.TableDataCell>
                  </Styled.TableRow>
                )
              })}
            </tbody>
          </Styled.Table>

          {filteredItems.length === 0 && (
            <Styled.EmptyState>
              <Styled.EmptyStateTitle>Нет позиций</Styled.EmptyStateTitle>
              <Styled.EmptyStateText>
                {activeTab === 'ingredients'
                  ? 'Нет ингредиентов или товаров для отображения'
                  : 'Нет техкарт или полуфабрикатов для отображения'}
              </Styled.EmptyStateText>
            </Styled.EmptyState>
          )}
        </Styled.TableContainer>
      </Styled.Content>

      <Styled.FooterBar>
        <Styled.FooterStats>
          <Styled.StatBlock>
            <Styled.StatLabel>План</Styled.StatLabel>
            <Styled.StatValue>
              {formatNumber(stats.totalPlanned)}
            </Styled.StatValue>
          </Styled.StatBlock>
          <Styled.StatBlock>
            <Styled.StatLabel>Факт</Styled.StatLabel>
            <Styled.StatValue>
              {formatNumber(stats.totalActual)}
            </Styled.StatValue>
          </Styled.StatBlock>
          <Styled.StatBlock>
            <Styled.StatLabel>Разница</Styled.StatLabel>
            <Styled.StatValue $color={getDifferenceColor(stats.totalDifference)}>
              {stats.totalDifference > 0 ? '+' : ''}
              {formatNumber(stats.totalDifference)}
            </Styled.StatValue>
          </Styled.StatBlock>
          <Styled.StatBlock>
            <Styled.StatLabel>Сумма разницы</Styled.StatLabel>
            <Styled.StatValue $color={getDifferenceColor(stats.totalDifference)}>
              {stats.totalDifferenceValue > 0 ? '+' : ''}
              {formatCurrency(Math.abs(stats.totalDifferenceValue))}
            </Styled.StatValue>
          </Styled.StatBlock>
        </Styled.FooterStats>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Styled.SearchInput
            placeholder="Поиск по названию"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSaving && <span style={{ fontSize: '14px', color: '#64748b' }}>Сохранение...</span>}
        </div>
      </Styled.FooterBar>
    </Styled.PageContainer>
  )
}
