import { useHallMap } from '../hooks/useHallMap'
import * as Styled from './styled'
import { useState, useRef, useCallback, useEffect } from 'react'

export const HallMap = () => {
  const {
    tables,
    rooms,
    selectedRoomId,
    isLoading,
    error,
    isAddHallModalOpen,
    isAddRoomModalOpen,
    isAddTableModalOpen,
    handleSelectRoom,
    handleAddHall,
    handleAddRoom,
    handleAddTable,
    handleCloseAddHallModal,
    handleCloseAddRoomModal,
    handleCloseAddTableModal,
    handleSaveHall,
    handleSaveRoom,
    handleSaveTable,
    handleDeleteTable,
    handleUpdateTablePosition,
    handleUpdateTableSize,
    handleUpdateTableShape,
    flushPendingUpdates,
  } = useHallMap()

  const [draggedTableId, setDraggedTableId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [resizingTableId, setResizingTableId] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleTableMouseDown = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      // Не начинаем перетаскивание, если клик был на кнопке удаления или resize handle
      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).classList.contains('resize-handle')) {
        return
      }
      e.preventDefault()
      const table = tables.find((t) => t.id === tableId)
      if (!table || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const offsetX = e.clientX - rect.left - table.position_x
      const offsetY = e.clientY - rect.top - table.position_y

      setDraggedTableId(tableId)
      setDragOffset({ x: offsetX, y: offsetY })
    },
    [tables]
  )

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, tableId: string, direction: string) => {
      e.preventDefault()
      e.stopPropagation()
      const table = tables.find((t) => t.id === tableId)
      if (!table || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const startX = e.clientX - rect.left
      const startY = e.clientY - rect.top

      setResizingTableId(tableId)
      setResizeDirection(direction)
      setResizeStart({
        x: startX,
        y: startY,
        width: table.width || 80,
        height: table.height || 80,
      })
    },
    [tables]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizingTableId && resizeStart && resizeDirection && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top

        const deltaX = currentX - resizeStart.x
        const deltaY = currentY - resizeStart.y

        let newWidth = resizeStart.width
        let newHeight = resizeStart.height

        // Вычисляем новый размер в зависимости от направления
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(40, resizeStart.width + deltaX)
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(40, resizeStart.width - deltaX)
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(40, resizeStart.height + deltaY)
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(40, resizeStart.height - deltaY)
        }

        handleUpdateTableSize(resizingTableId, newWidth, newHeight)
      } else if (draggedTableId && dragOffset && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const newX = e.clientX - rect.left - dragOffset.x
        const newY = e.clientY - rect.top - dragOffset.y

        handleUpdateTablePosition(draggedTableId, Math.max(0, newX), Math.max(0, newY))
      }
    },
    [draggedTableId, dragOffset, resizingTableId, resizeStart, resizeDirection, handleUpdateTablePosition, handleUpdateTableSize]
  )

  const handleMouseUp = useCallback(() => {
    setDraggedTableId(null)
    setDragOffset(null)
    setResizingTableId(null)
    setResizeStart(null)
    setResizeDirection(null)
  }, [])

  const handleTableDoubleClick = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      e.preventDefault()
      e.stopPropagation()
      const table = tables.find((t) => t.id === tableId)
      if (!table) return

      const currentShape = table.shape || 'round'
      const newShape = currentShape === 'round' ? 'square' : 'round'
      handleUpdateTableShape(tableId, newShape)
    },
    [tables, handleUpdateTableShape]
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      e.preventDefault()
      e.stopPropagation()
      if (window.confirm('Вы уверены, что хотите удалить этот стол?')) {
        handleDeleteTable(tableId)
      }
    },
    [handleDeleteTable]
  )

  // Добавляем обработчики для перетаскивания и изменения размера
  useEffect(() => {
    if (draggedTableId || resizingTableId) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedTableId, resizingTableId, handleMouseMove, handleMouseUp])

  const [hallName, setHallName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [tableName, setTableName] = useState('')
  const [tableCapacity, setTableCapacity] = useState('4')
  const [roomName, setRoomName] = useState('')
  const [roomDescription, setRoomDescription] = useState('')
  const [roomFloor, setRoomFloor] = useState('1')

  const handleSubmitHall = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        await handleSaveHall(hallName)
        setHallName('')
      } catch (error) {
        console.error('Failed to save hall:', error)
      }
    },
    [hallName, handleSaveHall]
  )

  const handleSubmitRoom = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        await handleSaveRoom({
          name: roomName,
          description: roomDescription || undefined,
          floor: roomFloor ? parseInt(roomFloor, 10) : 1,
        })
        setRoomName('')
        setRoomDescription('')
        setRoomFloor('1')
      } catch (error) {
        console.error('Failed to save room:', error)
      }
    },
    [roomName, roomDescription, roomFloor, handleSaveRoom]
  )

  const handleSubmitTable = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedRoomId) return

      const number = parseInt(tableNumber, 10)
      const capacity = parseInt(tableCapacity, 10)

      if (isNaN(number) || isNaN(capacity) || number < 1 || capacity < 1) {
        return
      }

      try {
        await handleSaveTable({
          number,
          name: tableName.trim() || undefined,
          capacity,
          position_x: 100,
          position_y: 100,
          rotation: 0,
          width: 80,
          height: 80,
          shape: 'round',
        })
        setTableNumber('')
        setTableName('')
        setTableCapacity('4')
      } catch (error) {
        console.error('Failed to save table:', error)
      }
    },
    [tableNumber, tableName, tableCapacity, selectedRoomId, handleSaveTable]
  )

  if (isLoading) {
    return (
      <Styled.PageContainer>
        <Styled.Title>Загрузка карты зала...</Styled.Title>
      </Styled.PageContainer>
    )
  }

  if (error) {
    return (
      <Styled.PageContainer>
        <Styled.Title>Ошибка при загрузке карты зала: {error.message}</Styled.Title>
      </Styled.PageContainer>
    )
  }

  return (
    <Styled.PageContainer>
      <Styled.Header>
        <Styled.HeaderLeft>
          <Styled.Title>Карта зала</Styled.Title>
        </Styled.HeaderLeft>
        <Styled.HeaderControls>
          <Styled.SelectorsGroup>
            <Styled.HallSelect
              value={selectedRoomId || ''}
              onChange={(e) => {
                if (e.target.value === '__add__') {
                  handleAddHall()
                  setTimeout(() => {
                    const select = e.target as HTMLSelectElement
                    select.value = selectedRoomId || ''
                  }, 0)
                } else {
                  handleSelectRoom(e.target.value || null)
                }
              }}
            >
              <option value="">Выберите зал</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
              <option value="__add__">+ Добавить зал</option>
            </Styled.HallSelect>

            {selectedRoomId && (
              <>
                <Styled.AddTableButton onClick={handleAddTable}>Добавить стол</Styled.AddTableButton>
              </>
            )}
          </Styled.SelectorsGroup>
        </Styled.HeaderControls>
      </Styled.Header>

      <Styled.CanvasContainer ref={canvasRef}>
        {selectedRoomId &&
          tables.map((table) => (
            <Styled.TableWrapper
              key={table.id}
              $x={table.position_x}
              $y={table.position_y}
              $rotation={table.rotation}
              onMouseEnter={() => setHoveredTableId(table.id)}
              onMouseLeave={() => setHoveredTableId(null)}
            >
              <Styled.TableElement
                $width={table.width || 80}
                $height={table.height || 80}
                $shape={table.shape || 'round'}
                $status={table.status}
                onMouseDown={(e) => handleTableMouseDown(e, table.id)}
                onDoubleClick={(e) => handleTableDoubleClick(e, table.id)}
                title={`Стол ${table.number}${table.name ? ` - ${table.name}` : ''}`}
              >
                {hoveredTableId === table.id && (
                  <Styled.TableDeleteButton
                    onClick={(e) => handleDeleteClick(e, table.id)}
                    title="Удалить стол"
                  >
                    ×
                  </Styled.TableDeleteButton>
                )}
                {table.number}
                <Styled.ResizeHandle
                  className="resize-handle"
                  $position="n"
                  onMouseDown={(e) => handleResizeMouseDown(e, table.id, 'n')}
                />
                <Styled.ResizeHandle
                  className="resize-handle"
                  $position="s"
                  onMouseDown={(e) => handleResizeMouseDown(e, table.id, 's')}
                />
                <Styled.ResizeHandle
                  className="resize-handle"
                  $position="e"
                  onMouseDown={(e) => handleResizeMouseDown(e, table.id, 'e')}
                />
                <Styled.ResizeHandle
                  className="resize-handle"
                  $position="w"
                  onMouseDown={(e) => handleResizeMouseDown(e, table.id, 'w')}
                />
                <Styled.ResizeHandle
                  className="resize-handle"
                  $position="ne"
                  onMouseDown={(e) => handleResizeMouseDown(e, table.id, 'ne')}
                />
                <Styled.ResizeHandle
                  className="resize-handle"
                  $position="nw"
                  onMouseDown={(e) => handleResizeMouseDown(e, table.id, 'nw')}
                />
                <Styled.ResizeHandle
                  className="resize-handle"
                  $position="se"
                  onMouseDown={(e) => handleResizeMouseDown(e, table.id, 'se')}
                />
                <Styled.ResizeHandle
                  className="resize-handle"
                  $position="sw"
                  onMouseDown={(e) => handleResizeMouseDown(e, table.id, 'sw')}
                />
              </Styled.TableElement>
            </Styled.TableWrapper>
          ))}
      </Styled.CanvasContainer>

      {selectedRoomId && (
        <Styled.BottomActions>
          <Styled.AddTableButton onClick={handleAddTable}>Создать стол</Styled.AddTableButton>
          <Styled.SaveButton onClick={flushPendingUpdates}>Сохранить</Styled.SaveButton>
        </Styled.BottomActions>
      )}

      {isAddHallModalOpen && (
        <Styled.ModalOverlay onClick={handleCloseAddHallModal}>
          <Styled.Modal onClick={(e) => e.stopPropagation()}>
            <Styled.ModalTitle>Добавление зала</Styled.ModalTitle>
            <Styled.ModalForm onSubmit={handleSubmitHall}>
              <Styled.FormGroup>
                <Styled.FormLabel>Название зала</Styled.FormLabel>
                <Styled.FormInput
                  type="text"
                  value={hallName}
                  onChange={(e) => setHallName(e.target.value)}
                  placeholder="Введите название зала"
                  required
                />
              </Styled.FormGroup>
              <Styled.ModalActions>
                <Styled.ModalButton type="button" onClick={handleCloseAddHallModal}>
                  Отмена
                </Styled.ModalButton>
                <Styled.ModalButton type="submit" $variant="primary">
                  Добавить
                </Styled.ModalButton>
              </Styled.ModalActions>
            </Styled.ModalForm>
          </Styled.Modal>
        </Styled.ModalOverlay>
      )}

      {isAddRoomModalOpen && (
        <Styled.ModalOverlay onClick={handleCloseAddRoomModal}>
          <Styled.Modal onClick={(e) => e.stopPropagation()}>
            <Styled.ModalTitle>Добавление помещения</Styled.ModalTitle>
            <Styled.ModalForm onSubmit={handleSubmitRoom}>
              <Styled.FormGroup>
                <Styled.FormLabel>Название помещения</Styled.FormLabel>
                <Styled.FormInput
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Например: Главный зал, Терраса"
                  required
                />
              </Styled.FormGroup>
              <Styled.FormGroup>
                <Styled.FormLabel>Описание (опционально)</Styled.FormLabel>
                <Styled.FormInput
                  type="text"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="Описание помещения"
                />
              </Styled.FormGroup>
              <Styled.FormGroup>
                <Styled.FormLabel>Этаж</Styled.FormLabel>
                <Styled.FormInput
                  type="number"
                  value={roomFloor}
                  onChange={(e) => setRoomFloor(e.target.value)}
                  placeholder="1"
                  min="1"
                  required
                />
              </Styled.FormGroup>
              <Styled.ModalActions>
                <Styled.ModalButton type="button" onClick={handleCloseAddRoomModal}>
                  Отмена
                </Styled.ModalButton>
                <Styled.ModalButton type="submit" $variant="primary">
                  Добавить
                </Styled.ModalButton>
              </Styled.ModalActions>
            </Styled.ModalForm>
          </Styled.Modal>
        </Styled.ModalOverlay>
      )}

      {isAddTableModalOpen && (
        <Styled.ModalOverlay onClick={handleCloseAddTableModal}>
          <Styled.Modal onClick={(e) => e.stopPropagation()}>
            <Styled.ModalTitle>Добавление стола</Styled.ModalTitle>
            <Styled.ModalForm onSubmit={handleSubmitTable}>
              <Styled.FormGroup>
                <Styled.FormLabel>Номер стола</Styled.FormLabel>
                <Styled.FormInput
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Введите номер стола"
                  min="1"
                  required
                />
              </Styled.FormGroup>
              <Styled.FormGroup>
                <Styled.FormLabel>Название (опционально)</Styled.FormLabel>
                <Styled.FormInput
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Введите название стола"
                />
              </Styled.FormGroup>
              <Styled.FormGroup>
                <Styled.FormLabel>Вместимость</Styled.FormLabel>
                <Styled.FormInput
                  type="number"
                  value={tableCapacity}
                  onChange={(e) => setTableCapacity(e.target.value)}
                  placeholder="Введите вместимость"
                  min="1"
                  required
                />
              </Styled.FormGroup>
              <Styled.ModalActions>
                <Styled.ModalButton type="button" onClick={handleCloseAddTableModal}>
                  Отмена
                </Styled.ModalButton>
                <Styled.ModalButton type="submit" $variant="primary">
                  Добавить
                </Styled.ModalButton>
              </Styled.ModalActions>
            </Styled.ModalForm>
          </Styled.Modal>
        </Styled.ModalOverlay>
      )}
    </Styled.PageContainer>
  )
}
