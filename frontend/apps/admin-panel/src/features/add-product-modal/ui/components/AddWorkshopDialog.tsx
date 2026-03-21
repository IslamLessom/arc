import { useState, useEffect } from 'react'
import { useCreateWorkshop, useGetWorkshops } from '@restaurant-pos/api-client'
import * as Styled from '../styled'

interface AddWorkshopDialogProps {
  isOpen: boolean
  onClose: () => void
  onWorkshopAdded?: (workshopId: string) => void
}

export const AddWorkshopDialog = ({ isOpen, onClose, onWorkshopAdded }: AddWorkshopDialogProps) => {
  const [workshopName, setWorkshopName] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const createWorkshopMutation = useCreateWorkshop()
  const { refetch: refetchWorkshops } = useGetWorkshops()

  useEffect(() => {
    if (!isOpen) {
      setWorkshopName('')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = workshopName.trim()
    if (!trimmedName) {
      setError('Введите название цеха')
      return
    }

    try {
      const newWorkshop = await createWorkshopMutation.mutateAsync({
        name: trimmedName,
      })
      
      await refetchWorkshops()
      onWorkshopAdded?.(newWorkshop.id)
      onClose()
      setWorkshopName('')
    } catch (err) {
      console.error('Failed to create workshop:', err)
      setError('Ошибка при создании цеха')
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Styled.DialogOverlay $isOpen={isOpen} onClick={onClose}>
      <Styled.DialogContainer onClick={(e) => e.stopPropagation()}>
        <Styled.DialogHeader>
          <Styled.DialogTitle>Добавить цех</Styled.DialogTitle>
          <Styled.DialogCloseButton onClick={onClose}>×</Styled.DialogCloseButton>
        </Styled.DialogHeader>

        <Styled.DialogForm onSubmit={handleSubmit}>
          <Styled.DialogInputGroup>
            <Styled.DialogLabel>
              Название <Styled.Required>*</Styled.Required>
            </Styled.DialogLabel>
            <Styled.DialogInput
              type="text"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
              placeholder="Например, «Холодный цех» или «Горячий цех»"
              disabled={createWorkshopMutation.isPending}
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
              $disabled={createWorkshopMutation.isPending || !workshopName.trim()}
            >
              {createWorkshopMutation.isPending ? 'Добавление...' : 'Добавить'}
            </Styled.DialogSubmitButton>
          </Styled.DialogButtonGroup>
        </Styled.DialogForm>
      </Styled.DialogContainer>
    </Styled.DialogOverlay>
  )
}
