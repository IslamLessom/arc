import * as Styled from './styled'
import { useEffect, useRef, useState, useCallback } from 'react'

interface GuestsDropdownProps {
  position: { x: number; y: number }
  selectedValue: number
  onSelect: (count: number) => void
  onClose: () => void
}

const GUESTS_MIN = 1
const GUESTS_MAX = 16

export function GuestsDropdown({ position, selectedValue, onSelect, onClose }: GuestsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top')

  // Вычисляем оптимальное положение dropdown
  const calculatePlacement = useCallback(() => {
    if (!dropdownRef.current) return

    const dropdownHeight = dropdownRef.current.offsetHeight
    const viewportHeight = window.innerHeight
    const spaceAbove = position.y
    const spaceBelow = viewportHeight - position.y

    // Показываем снизу, если сверху недостаточно места (с запасом 20px)
    if (spaceAbove < dropdownHeight + 20 && spaceBelow > spaceAbove) {
      setPlacement('bottom')
    } else {
      setPlacement('top')
    }
  }, [position.y])

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Вычисляем позицию при первом рендере
  useEffect(() => {
    calculatePlacement()
  }, [calculatePlacement])

  // Генерируем опции от 1 до 16
  const options = Array.from({ length: GUESTS_MAX - GUESTS_MIN + 1 }, (_, i) => GUESTS_MIN + i)

  // Вычисляем позицию dropdown
  const getDropdownStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      left: `${position.x}px`,
      transform: 'translateX(-50%)',
    }

    if (placement === 'top') {
      return {
        ...baseStyle,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-10px)',
      }
    } else {
      return {
        ...baseStyle,
        top: `${position.y}px`,
        transform: 'translate(-50%, 0) translateY(10px)',
      }
    }
  }

  return (
    <Styled.GuestsDropdownWrapper ref={dropdownRef} style={getDropdownStyle()} $placement={placement}>
      <Styled.DropdownTriangle $placement={placement} />
      <Styled.DropdownHeader>Кол-во гостей</Styled.DropdownHeader>
      <Styled.DropdownList>
        {options.map(option => (
          <Styled.DropdownItem
            key={option}
            $selected={option === selectedValue}
            onClick={() => onSelect(option)}
          >
            {option}
          </Styled.DropdownItem>
        ))}
      </Styled.DropdownList>
    </Styled.GuestsDropdownWrapper>
  )
}
