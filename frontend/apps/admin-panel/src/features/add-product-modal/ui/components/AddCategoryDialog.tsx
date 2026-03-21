import { useState, useEffect } from 'react'
import { useCreateCategory, useGetCategories } from '@restaurant-pos/api-client'
import * as Styled from '../styled'

interface AddCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onCategoryAdded?: (categoryId: string) => void
}

export const AddCategoryDialog = ({ isOpen, onClose, onCategoryAdded }: AddCategoryDialogProps) => {
  const [categoryName, setCategoryName] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const createCategoryMutation = useCreateCategory()
  const { refetch: refetchCategories } = useGetCategories({ type: 'product' })

  useEffect(() => {
    if (!isOpen) {
      setCategoryName('')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = categoryName.trim()
    if (!trimmedName) {
      setError('Введите название категории')
      return
    }

    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: trimmedName,
        type: 'product',
      })
      
      await refetchCategories()
      onCategoryAdded?.(newCategory.id)
      onClose()
      setCategoryName('')
    } catch (err) {
      console.error('Failed to create category:', err)
      setError('Ошибка при создании категории')
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Styled.DialogOverlay $isOpen={isOpen} onClick={onClose}>
      <Styled.DialogContainer onClick={(e) => e.stopPropagation()}>
        <Styled.DialogHeader>
          <Styled.DialogTitle>Добавить категорию</Styled.DialogTitle>
          <Styled.DialogCloseButton onClick={onClose}>×</Styled.DialogCloseButton>
        </Styled.DialogHeader>

        <Styled.DialogForm onSubmit={handleSubmit}>
          <Styled.DialogInputGroup>
            <Styled.DialogLabel>
              Название <Styled.Required>*</Styled.Required>
            </Styled.DialogLabel>
            <Styled.DialogInput
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Например, «Напитки» или «Десерты»"
              disabled={createCategoryMutation.isPending}
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
              $disabled={createCategoryMutation.isPending || !categoryName.trim()}
            >
              {createCategoryMutation.isPending ? 'Добавление...' : 'Добавить'}
            </Styled.DialogSubmitButton>
          </Styled.DialogButtonGroup>
        </Styled.DialogForm>
      </Styled.DialogContainer>
    </Styled.DialogOverlay>
  )
}
