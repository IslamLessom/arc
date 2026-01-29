import { useState, useEffect } from 'react'
import { useSupplyDetailsModal } from '../hooks/useSupplyDetailsModal'
import type { SupplyDetailsModalProps } from '../model/types'
import * as Styled from './styled'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString('ru-RU', { month: 'long' })
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

const statusLabels: Record<string, string> = {
  completed: 'Оплаченная',
  pending: 'Неоплаченная',
  cancelled: 'Отменённая',
}

export const SupplyDetailsModal = (props: SupplyDetailsModalProps) => {
  const { isOpen, onClose } = props
  const { supply, isLoading, error, mode, setMode, onSave, onCancel, onToggleStatus } = useSupplyDetailsModal(props)

  const [editedSupply, setEditedSupply] = useState(supply)

  useEffect(() => {
    setEditedSupply(supply)
  }, [supply])

  const handleSave = () => {
    onSave(editedSupply)
  }

  if (!isOpen) {
    return null
  }

  const totalAmount = supply?.items?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0
  const isPaid = supply?.status === 'completed'
  const debt = isPaid ? 0 : totalAmount

  return (
    <Styled.Overlay $isOpen={isOpen} onClick={onClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.HeaderContent>
            <Styled.HeaderIcon>📦</Styled.HeaderIcon>
            <div>
              <Styled.HeaderTitle>Детали поставки</Styled.HeaderTitle>
              <Styled.HeaderSubtitle>
                {supply ? `#${supply.id.slice(-6).toUpperCase()}` : 'Загрузка...'}
              </Styled.HeaderSubtitle>
            </div>
          </Styled.HeaderContent>
          <Styled.HeaderActions>
            {mode === 'view' ? (
              <>
                <Styled.ActionButton onClick={onToggleStatus}>
                  {supply?.status === 'completed' ? 'Отметить неоплаченной' : 'Отметить оплаченной'}
                </Styled.ActionButton>
                <Styled.ActionButton onClick={() => setMode('edit')}>Редактировать</Styled.ActionButton>
                <Styled.CloseButton onClick={onClose}>×</Styled.CloseButton>
              </>
            ) : (
              <>
                <Styled.ActionButton onClick={onCancel}>Отмена</Styled.ActionButton>
                <Styled.ActionButton $variant="primary" onClick={handleSave}>Сохранить</Styled.ActionButton>
              </>
            )}
          </Styled.HeaderActions>
        </Styled.ModalHeader>

        <Styled.ModalBody>
          {isLoading ? (
            <Styled.LoadingContainer>
              <Styled.Spinner />
              <Styled.LoadingText>Загрузка данных...</Styled.LoadingText>
            </Styled.LoadingContainer>
          ) : error ? (
            <Styled.ErrorContainer>
              <Styled.ErrorIcon>⚠️</Styled.ErrorIcon>
              <Styled.ErrorText>{error}</Styled.ErrorText>
            </Styled.ErrorContainer>
          ) : !supply ? (
            <Styled.EmptyState>
              <Styled.EmptyStateIcon>📭</Styled.EmptyStateIcon>
              <Styled.EmptyStateText>Данные о поставке не найдены</Styled.EmptyStateText>
            </Styled.EmptyState>
          ) : (
            <>
              {/* Основная информация */}
              <Styled.Section>
                <Styled.SectionTitle>
                  <Styled.SectionIcon>📋</Styled.SectionIcon>
                  Основная информация
                </Styled.SectionTitle>
                <Styled.InfoGrid>
                  <Styled.InfoCard>
                    <Styled.InfoLabel>
                      <Styled.InfoLabelIcon>📅</Styled.InfoLabelIcon>
                      Дата поставки
                    </Styled.InfoLabel>
                    <Styled.InfoValue>{formatDate(supply.delivery_date_time)}</Styled.InfoValue>
                  </Styled.InfoCard>

                  <Styled.InfoCard>
                    <Styled.InfoLabel>
                      <Styled.InfoLabelIcon>📊</Styled.InfoLabelIcon>
                      Статус
                    </Styled.InfoLabel>
                    <Styled.InfoValue>
                      <Styled.StatusBadge $status={supply.status}>
                        {statusLabels[supply.status] || supply.status}
                      </Styled.StatusBadge>
                    </Styled.InfoValue>
                  </Styled.InfoCard>

                  <Styled.InfoCard>
                    <Styled.InfoLabel>
                      <Styled.InfoLabelIcon>🏭</Styled.InfoLabelIcon>
                      Склад
                    </Styled.InfoLabel>
                    <Styled.InfoValue>{supply.warehouse?.name || '-'}</Styled.InfoValue>
                  </Styled.InfoCard>

                  <Styled.InfoCard>
                    <Styled.InfoLabel>
                      <Styled.InfoLabelIcon>💰</Styled.InfoLabelIcon>
                      Общая сумма
                    </Styled.InfoLabel>
                    <Styled.InfoValue>{formatPrice(totalAmount)} ₽</Styled.InfoValue>
                  </Styled.InfoCard>
                </Styled.InfoGrid>
              </Styled.Section>

              {/* Информация о поставщике */}
              <Styled.Section>
                <Styled.SectionTitle>
                  <Styled.SectionIcon>🚚</Styled.SectionIcon>
                  Поставщик
                </Styled.SectionTitle>
                <Styled.InfoGrid>
                  {supply.supplier?.name && (
                    <Styled.InfoCard>
                      <Styled.InfoLabel>
                        <Styled.InfoLabelIcon>🏢</Styled.InfoLabelIcon>
                        Название
                      </Styled.InfoLabel>
                      <Styled.InfoValue>{supply.supplier.name}</Styled.InfoValue>
                    </Styled.InfoCard>
                  )}

                  {supply.supplier?.phone && (
                    <Styled.InfoCard>
                      <Styled.InfoLabel>
                        <Styled.InfoLabelIcon>📞</Styled.InfoLabelIcon>
                        Телефон
                      </Styled.InfoLabel>
                      <Styled.InfoValue>{supply.supplier.phone}</Styled.InfoValue>
                    </Styled.InfoCard>
                  )}

                  {supply.supplier?.address && (
                    <Styled.InfoCard>
                      <Styled.InfoLabel>
                        <Styled.InfoLabelIcon>📍</Styled.InfoLabelIcon>
                        Адрес
                      </Styled.InfoLabel>
                      <Styled.InfoValue>{supply.supplier.address}</Styled.InfoValue>
                    </Styled.InfoCard>
                  )}
                </Styled.InfoGrid>
              </Styled.Section>

              {/* Товары */}
              {supply.items && supply.items.length > 0 && (
                <Styled.Section>
                  <Styled.SectionTitle>
                    <Styled.SectionIcon>📦</Styled.SectionIcon>
                    Товары ({supply.items.length})
                  </Styled.SectionTitle>
                  <Styled.ItemsTable>
                    <Styled.ItemsTableHeader>
                      <div>Наименование</div>
                      <div>Кол-во</div>
                      <div>Цена</div>
                      <div>Сумма</div>
                      <div></div>
                    </Styled.ItemsTableHeader>
                    {supply.items.map((item) => (
                      <Styled.ItemsTableRow key={item.id}>
                        <div>
                          <Styled.ItemName>
                            {item.ingredient?.name || item.product?.name || '-'}
                          </Styled.ItemName>
                          <Styled.ItemSecondary>
                            {item.ingredient ? 'Ингредиент' : 'Продукт'}
                          </Styled.ItemSecondary>
                        </div>
                        <Styled.ItemValue>
                          {formatPrice(item.quantity)} {item.unit}
                        </Styled.ItemValue>
                        <Styled.ItemValue>
                          {formatPrice(item.price_per_unit)} ₽/{item.unit}
                        </Styled.ItemValue>
                        <Styled.ItemValue>
                          {formatPrice(item.total_amount)} ₽
                        </Styled.ItemValue>
                        <Styled.ItemValue>
                          {item.ingredient?.unit || item.product?.unit || ''}
                        </Styled.ItemValue>
                      </Styled.ItemsTableRow>
                    ))}
                    <Styled.TotalRow>
                      <Styled.TotalLabel>Итого по поставке:</Styled.TotalLabel>
                      <Styled.TotalAmount>{formatPrice(totalAmount)} ₽</Styled.TotalAmount>
                    </Styled.TotalRow>
                  </Styled.ItemsTable>

                  {!isPaid && debt > 0 && (
                    <Styled.DebtInfoCard>
                      <Styled.DebtInfoLabel>
                        <Styled.InfoLabelIcon>⚠️</Styled.InfoLabelIcon>
                        Задолженность
                      </Styled.DebtInfoLabel>
                      <Styled.DebtInfoValue>
                        {formatPrice(debt)} ₽
                      </Styled.DebtInfoValue>
                    </Styled.DebtInfoCard>
                  )}
                </Styled.Section>
              )}

              {/* Комментарий */}
              {supply.comment && (
                <Styled.Section>
                  <Styled.SectionTitle>
                    <Styled.SectionIcon>💬</Styled.SectionIcon>
                    Комментарий
                  </Styled.SectionTitle>
                  <Styled.CommentBox>
                    <Styled.CommentIcon>📝</Styled.CommentIcon>
                    <Styled.CommentText>{supply.comment}</Styled.CommentText>
                  </Styled.CommentBox>
                </Styled.Section>
              )}

              {/* Дополнительная информация */}
              <Styled.Section>
                <Styled.SectionTitle>
                  <Styled.SectionIcon>ℹ️</Styled.SectionIcon>
                  Служебная информация
                </Styled.SectionTitle>
                <Styled.InfoGrid>
                  <Styled.InfoCard>
                    <Styled.InfoLabel>
                      <Styled.InfoLabelIcon>🆔</Styled.InfoLabelIcon>
                      ID поставки
                    </Styled.InfoLabel>
                    <Styled.MonospaceInfoValue>
                      {supply.id}
                    </Styled.MonospaceInfoValue>
                  </Styled.InfoCard>

                  <Styled.InfoCard>
                    <Styled.InfoLabel>
                      <Styled.InfoLabelIcon>🕐</Styled.InfoLabelIcon>
                      Создано
                    </Styled.InfoLabel>
                    <Styled.SmallInfoValue>
                      {formatDate(supply.created_at)}
                    </Styled.SmallInfoValue>
                  </Styled.InfoCard>

                  <Styled.InfoCard>
                    <Styled.InfoLabel>
                      <Styled.InfoLabelIcon>🔄</Styled.InfoLabelIcon>
                      Обновлено
                    </Styled.InfoLabel>
                    <Styled.SmallInfoValue>
                      {formatDate(supply.updated_at)}
                    </Styled.SmallInfoValue>
                  </Styled.InfoCard>
                </Styled.InfoGrid>
              </Styled.Section>
            </>
          )}
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}
