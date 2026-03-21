import * as Styled from './styled'
import { useTableSelection } from '../hooks/useTableSelection'
import type { Table } from '@restaurant-pos/api-client'
import { GuestsDropdown } from './GuestsDropdown'

export function TableSelection() {
  const {
    rooms,
    selectedRoomId,
    selectedTable,
    isLoading,
    handleTableClick,
    handleCancel,
    handleRoomChange,
    isCreatingOrder,
    showGuestsDropdown,
    selectedGuestsCount,
    handleGuestsSelect,
    handleGuestsDropdownClose,
    getDropdownPosition,
    getOrderForTable,
  } = useTableSelection()

  // Находим выбранный зал
  const selectedRoom = rooms.find(r => r.room.id === selectedRoomId)
  const tables = selectedRoom?.tables?.filter((t: Table) => t.active) || []

  // Получаем фон из данных комнаты
  const backgroundImage = selectedRoom?.room?.background_image_url || null
  const resolvedBackgroundType = backgroundImage ? 'photo' : 'grid'

  // Вычисляем размеры контейнера для схемы
  const getMaxPosition = () => {
    if (tables.length === 0) return { x: 800, y: 600 }
    const maxX = Math.max(...tables.map(t => (t.position_x || 0) + (t.width || 80)))
    const maxY = Math.max(...tables.map(t => (t.position_y || 0) + (t.height || 80)))
    return {
      x: Math.max(maxX + 100, 800),
      y: Math.max(maxY + 100, 600)
    }
  }

  const mapSize = getMaxPosition()

  if (isLoading) {
    return (
      <Styled.Container>
        <Styled.Header>
          <Styled.HeaderLeft onClick={handleCancel}>
            <Styled.BackIcon />
          </Styled.HeaderLeft>
          <Styled.HeaderTitle>Столы</Styled.HeaderTitle>
          <Styled.HeaderRight />
        </Styled.Header>
        <Styled.MainContent>
          <Styled.LoadingContainer>Загрузка...</Styled.LoadingContainer>
        </Styled.MainContent>
      </Styled.Container>
    )
  }

  if (rooms.length === 0) {
    return (
      <Styled.Container>
        <Styled.Header>
          <Styled.HeaderLeft onClick={handleCancel}>
            <Styled.BackIcon />
          </Styled.HeaderLeft>
          <Styled.HeaderTitle>Столы</Styled.HeaderTitle>
          <Styled.HeaderRight />
        </Styled.Header>
        <Styled.MainContent>
          <Styled.EmptyState>
            <Styled.EmptyStateIcon>🏢</Styled.EmptyStateIcon>
            <Styled.EmptyStateText>
              Нет доступных залов. Пожалуйста, создайте залы в админ-панели.
            </Styled.EmptyStateText>
          </Styled.EmptyState>
        </Styled.MainContent>
      </Styled.Container>
    )
  }

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.HeaderLeft onClick={handleCancel}>
          <Styled.BackIcon />
        </Styled.HeaderLeft>
        <Styled.HeaderTitle>Столы</Styled.HeaderTitle>
        <Styled.HeaderRight />
      </Styled.Header>

      <Styled.MainContent>
        <Styled.RoomSelector>
          <Styled.RoomSelect value={selectedRoomId || undefined} onChange={handleRoomChange}>
            {rooms.map(r => (
              <option key={r.room.id} value={r.room.id}>
                {r.room.name}
              </option>
            ))}
          </Styled.RoomSelect>
        </Styled.RoomSelector>

        <Styled.HallMapContainer 
          $backgroundType={resolvedBackgroundType}
          $backgroundImage={backgroundImage}
        >
          {isCreatingOrder && (
            <Styled.LoadingOverlay>
              Создание заказа...
            </Styled.LoadingOverlay>
          )}

          {tables.length === 0 ? (
            <Styled.EmptyState>
              <Styled.EmptyStateIcon>🪑</Styled.EmptyStateIcon>
              <Styled.EmptyStateText>
                В этом зале пока нет столов
              </Styled.EmptyStateText>
            </Styled.EmptyState>
          ) : (
            <Styled.HallMap $minWidth={mapSize.x} $minHeight={mapSize.y}>
              {tables.map((table: Table) => {
                const draftOrder = getOrderForTable(table.id)
                const isTableReserved = !!draftOrder
                
                // Логика блокирования: стол заблокирован если занят И нет черновика
                const isTableBlocked = table.status === 'occupied' && !isTableReserved
                
                // Определяем статус для отображения
                const displayStatus = isTableReserved ? 'reserved' : table.status

                return (
                  <Styled.TableShape
                    key={table.id}
                    $x={table.position_x || 0}
                    $y={table.position_y || 0}
                    $width={table.width || 80}
                    $height={table.height || 80}
                    $shape={table.shape}
                    $status={displayStatus}
                    $selected={selectedTable?.id === table.id}
                    onClick={() => {
                      // Разрешаем клик если стол не заблокирован
                      if (!isTableBlocked) {
                        handleTableClick(table)
                      }
                    }}
                    title={
                      isTableBlocked 
                        ? 'Стол занят и ожидает оплаты' 
                        : isTableReserved 
                          ? `Заказ №${draftOrder.id?.slice(0, 8)}... [${draftOrder.status}]` 
                          : 'Клик для создания заказа'
                    }
                  >
                    <Styled.TableNumber>{table.name || table.number}</Styled.TableNumber>
                    <Styled.TableCapacity>{table.capacity} чел.</Styled.TableCapacity>
                    {draftOrder && (
                      <Styled.TableOrderInfo 
                        title={`Статус: ${draftOrder.status?.toUpperCase()}\nСумма: ${draftOrder.total_amount}₽\nПозиции: ${draftOrder.items?.length || 0}\n${draftOrder.guest_name ? `Гость: ${draftOrder.guest_name}` : ''}`}
                      >
                        {draftOrder.source === 'qr_menu' && (
                          <div style={{ fontSize: '0.65rem', color: '#7c3aed', fontWeight: 700 }}>
                            📱 {draftOrder.guest_name || 'QR-заказ'}
                          </div>
                        )}
                        <div>📝 {draftOrder.total_amount}₽</div>
                        <div>({draftOrder.items?.length || 0} позиций)</div>
                      </Styled.TableOrderInfo>
                    )}
                  </Styled.TableShape>
                )
              })}

              {/* Dropdown с выбором количества гостей */}
              {showGuestsDropdown && selectedTable && (
                <GuestsDropdown
                  position={getDropdownPosition()}
                  selectedValue={selectedGuestsCount}
                  onSelect={handleGuestsSelect}
                  onClose={handleGuestsDropdownClose}
                />
              )}
            </Styled.HallMap>
          )}
        </Styled.HallMapContainer>
      </Styled.MainContent>
    </Styled.Container>
  )
}

