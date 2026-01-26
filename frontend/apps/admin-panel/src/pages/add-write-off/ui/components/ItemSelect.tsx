import { useState, useRef, useEffect } from 'react'
import * as Styled from '../styled'

interface Item {
  id: string
  name: string
  unit: string
  type: 'ingredient' | 'product'
}

interface ItemSelectProps {
  value?: string
  items: { ingredients: Array<{ id: string; name: string; unit: string }>; products: Array<{ id: string; name: string; unit: string }> }
  onChange: (itemId: string, itemName: string, unit: string, type: 'ingredient' | 'product') => void
  placeholder?: string
}

export const ItemSelect = ({ value, items, onChange, placeholder = 'Выберите......' }: ItemSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const allItems: Item[] = [
    ...items.ingredients.map(ing => ({ ...ing, type: 'ingredient' as const })),
    ...items.products.map(prod => ({ ...prod, type: 'product' as const }))
  ]

  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedItem = allItems.find(item => item.id === value)

  const handleItemClick = (item: Item) => {
    onChange(item.id, item.name, item.unit, item.type)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <Styled.ItemSelectWrapper ref={wrapperRef}>
      <Styled.ItemSelectInput
        type="text"
        value={selectedItem ? `${selectedItem.name} (${selectedItem.unit})` : ''}
        placeholder={placeholder}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <Styled.Dropdown>
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '14px',
              outline: 'none'
            }}
            autoFocus
          />
          {items.ingredients.length > 0 && (
            <>
              <Styled.DropdownCategory>Товары</Styled.DropdownCategory>
              {filteredItems
                .filter(item => item.type === 'ingredient')
                .map(item => (
                  <Styled.DropdownItem
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.name} ({item.unit})
                  </Styled.DropdownItem>
                ))}
            </>
          )}
          {items.products.length > 0 && (
            <>
              <Styled.DropdownCategory>Блюда</Styled.DropdownCategory>
              {filteredItems
                .filter(item => item.type === 'product')
                .map(item => (
                  <Styled.DropdownItem
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.name} ({item.unit})
                  </Styled.DropdownItem>
                ))}
            </>
          )}
          {items.ingredients.length === 0 && items.products.length === 0 && (
            <Styled.DropdownItem style={{ color: '#94a3b8', cursor: 'default' }}>
              Нет доступных товаров
            </Styled.DropdownItem>
          )}
          {filteredItems.length === 0 && (
            <Styled.DropdownItem style={{ color: '#94a3b8', cursor: 'default' }}>
              Ничего не найдено
            </Styled.DropdownItem>
          )}
        </Styled.Dropdown>
      )}
    </Styled.ItemSelectWrapper>
  )
}

