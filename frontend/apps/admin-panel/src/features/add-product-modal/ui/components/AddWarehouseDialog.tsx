import { useState, useEffect } from 'react'
import { useCreateWarehouse, useGetWarehouses } from '@restaurant-pos/api-client'
import * as Styled from '../styled'

interface AddWarehouseDialogProps {
  isOpen: boolean
  onClose: () => void
  onWarehouseAdded?: (warehouseId: string) => void
}

export const AddWarehouseDialog = ({ isOpen, onClose, onWarehouseAdded }: AddWarehouseDialogProps) => {
  const [warehouseName, setWarehouseName] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const createWarehouseMutation = useCreateWarehouse()
  const { refetch: refetchWarehouses } = useGetWarehouses()

  useEffect(() => {
    if (!isOpen) {
      setWarehouseName('')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = warehouseName.trim()
    if (!trimmedName) {
      setError('Введите название склада')
      return
    }

    try {
      const newWarehouse = await createWarehouseMutation.mutateAsync({
        name: trimmedName,
      })
      
      await refetchWarehouses()
      onWarehouseAdded?.(newWarehouse.id)
      onClose()
      setWarehouseName('')
    } catch (err) {
      console.error('Failed to create warehouse:', err)
      setError('Ошибка при создании склада')
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Styled.DialogOverlay $isOpen={isOpen} onClick={onClose}>
      <Styled.DialogContainer onClick={(e) => e.stopPropagation()}>
        <Styled.DialogHeader>
          <Styled.DialogTitle>Добавить склад</Styled.DialogTitle>
          <Styled.DialogCloseButton onClick={onClose}>×</Styled.DialogCloseButton>
        </Styled.DialogHeader>

        <Styled.DialogForm onSubmit={handleSubmit}>
          <Styled.DialogInputGroup>
            <Styled.DialogLabel>
              Название <Styled.Required>*</Styled.Required>
            </Styled.DialogLabel>
            <Styled.DialogInput
              type="text"
              value={warehouseName}
              onChange={(e) => setWarehouseName(e.target.value)}
              placeholder="Например, «Основной склад»"
              disabled={createWarehouseMutation.isPending}
              autoFocus
            />
          </Styled.DialogInputGroup>

          {error && <Styled.FieldError>{error}</Styled.FieldError>}

          <Styled.DialogButtonGroup>
            <Styled.DialogCancelButton type="button" onClick={onClose}>
              Отмена
            </Styled.DialogCancelButton>
            <Styled.DialogSubmitButton 
              type="submit"
              $disabled={createWarehouseMutation.isPending || !warehouseName.trim()}
            >
              {createWarehouseMutation.isPending ? 'Добавление...' : 'Добавить'}
            </Styled.DialogSubmitButton>
          </Styled.DialogButtonGroup>
        </Styled.DialogForm>
      </Styled.DialogContainer>
    </Styled.DialogOverlay>
  )
}
