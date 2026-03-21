import React from 'react'
import styled from 'styled-components'

export interface ColumnInfo {
  key: string
  title: string
  visible: boolean
  required?: boolean
}

export interface ColumnManagerProps {
  columns: ColumnInfo[]
  onToggle: (columnKey: string) => void
  onShowAll?: () => void
  onHideAll?: () => void
  onReset?: () => void
  onClose: () => void
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`

const Modal = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
    color: #1f2937;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
`

const ColumnList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: #f3f4f6;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 4px;
    
    &:hover {
      background-color: #9ca3af;
    }
  }
`

const ColumnItem = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  
  ${props => !props.$disabled && `
    &:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
    }
  `}
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin-right: 12px;
  cursor: pointer;
  accent-color: #3b82f6;
`

const ColumnLabel = styled.label`
  flex: 1;
  cursor: pointer;
  font-size: 14px;
  color: #1f2937;
  user-select: none;
`

const RequiredBadge = styled.span`
  font-size: 11px;
  padding: 2px 8px;
  background-color: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-weight: 500;
`

const Footer = styled.div`
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
`

const CloseModalButton = styled.button`
  padding: 10px 20px;
  background-color: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: #2563eb;
  }
`

/**
 * Column Manager Modal Component
 * Allows users to show/hide table columns
 */
export const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  onToggle,
  onShowAll,
  onHideAll,
  onReset,
  onClose
}) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const visibleCount = columns.filter(col => col.visible).length

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <Header>
          <Title>Управление столбцами</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Actions>
          {onShowAll && (
            <ActionButton onClick={onShowAll}>
              ✓ Показать все
            </ActionButton>
          )}
          {onHideAll && (
            <ActionButton onClick={onHideAll}>
              ✗ Скрыть все
            </ActionButton>
          )}
          {onReset && (
            <ActionButton onClick={onReset}>
              ↻ Сбросить
            </ActionButton>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: '13px', color: '#6b7280', padding: '6px' }}>
            Видимо: {visibleCount} из {columns.length}
          </div>
        </Actions>

        <ColumnList>
          {columns.map(column => (
            <ColumnItem
              key={column.key}
              $disabled={column.required}
              onClick={() => !column.required && onToggle(column.key)}
            >
              <Checkbox
                type="checkbox"
                checked={column.visible}
                onChange={() => !column.required && onToggle(column.key)}
                disabled={column.required}
              />
              <ColumnLabel>
                {column.title}
              </ColumnLabel>
              {column.required && (
                <RequiredBadge>Обязательный</RequiredBadge>
              )}
            </ColumnItem>
          ))}
        </ColumnList>

        <Footer>
          <CloseModalButton onClick={onClose}>
            Закрыть
          </CloseModalButton>
        </Footer>
      </Modal>
    </Overlay>
  )
}
