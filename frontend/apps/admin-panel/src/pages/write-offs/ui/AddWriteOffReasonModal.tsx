import { useState, useEffect, useCallback } from 'react'
import type { WriteOffReason, WriteOffReasonFormData } from '../model/types'
import { WriteOffReasonPnlBlock } from '../model/types'
import * as Styled from './AddWriteOffReasonModal.styled'

interface AddWriteOffReasonModalProps {
  isOpen: boolean
  reason?: WriteOffReason | null
  onClose: () => void
  onSuccess?: () => void
  onSubmit: (id: string | null, data: WriteOffReasonFormData) => void
  isSubmitting?: boolean
}

export const AddWriteOffReasonModal = (props: AddWriteOffReasonModalProps) => {
  const [formData, setFormData] = useState<WriteOffReasonFormData>({
    name: '',
    pnlBlock: WriteOffReasonPnlBlock.COST,
  })
  const [error, setError] = useState<string | null>(null)

  // Загружаем данные при редактировании
  useEffect(() => {
    if (props.reason) {
      setFormData({
        name: props.reason.name,
        pnlBlock: props.reason.pnlBlock,
      })
    } else {
      setFormData({
        name: '',
        pnlBlock: WriteOffReasonPnlBlock.COST,
      })
    }
    setError(null)
  }, [props.reason, props.isOpen])

  const handleFieldChange = useCallback((field: keyof WriteOffReasonFormData, value: string | WriteOffReasonPnlBlock) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!formData.name.trim()) {
        setError('Название причины обязательно')
        return
      }

      try {
        const reasonId = props.reason?.id || null
        props.onSubmit(reasonId, formData)

        props.onSuccess?.()
        props.onClose()

        // Сброс формы
        setFormData({
          name: '',
          pnlBlock: WriteOffReasonPnlBlock.COST,
        })
        setError(null)
      } catch (err) {
        console.error('Failed to save reason:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Не удалось сохранить причину. Попробуйте еще раз.'
        )
      }
    },
    [formData, props]
  )

  const handleClose = useCallback(() => {
    if (!props.isSubmitting) {
      props.onClose()
    }
  }, [props.isSubmitting, props])

  if (!props.isOpen) {
    return null
  }

  const modalTitle = props.reason ? 'Редактирование причины списания' : 'Добавление причины списания'

  return (
    <Styled.ModalOverlay $isOpen={props.isOpen} onClick={handleClose}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <Styled.ModalHeaderLeft>
            <Styled.ModalBackButton onClick={handleClose}>←</Styled.ModalBackButton>
            <Styled.ModalTitle>{modalTitle}</Styled.ModalTitle>
          </Styled.ModalHeaderLeft>
        </Styled.ModalHeader>

        <Styled.ModalBody>
          {error && <Styled.ModalErrorMessage>{error}</Styled.ModalErrorMessage>}

          <Styled.ModalForm onSubmit={handleSubmit}>
            <Styled.ModalInputGroup>
              <Styled.ModalLabel>
                Название
                <Styled.ModalRequired>*</Styled.ModalRequired>
              </Styled.ModalLabel>
              <Styled.ModalInput
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Введите название причины"
                disabled={props.isSubmitting}
                required
              />
            </Styled.ModalInputGroup>

            <Styled.ModalInputGroup>
              <Styled.ModalLabel>
                Учитывать в блоке P&L
              </Styled.ModalLabel>
              <Styled.PnlBlockSelector>
                <Styled.PnlBlockOption
                  $active={formData.pnlBlock === WriteOffReasonPnlBlock.COST}
                  onClick={() => handleFieldChange('pnlBlock', WriteOffReasonPnlBlock.COST)}
                  type="button"
                  disabled={props.isSubmitting}
                >
                  Себестоимость
                </Styled.PnlBlockOption>
                <Styled.PnlBlockOption
                  $active={formData.pnlBlock === WriteOffReasonPnlBlock.EXPENSES}
                  onClick={() => handleFieldChange('pnlBlock', WriteOffReasonPnlBlock.EXPENSES)}
                  type="button"
                  disabled={props.isSubmitting}
                >
                  Расходы
                </Styled.PnlBlockOption>
              </Styled.PnlBlockSelector>
            </Styled.ModalInputGroup>

            <Styled.ModalButtonGroup>
              <Styled.ModalSubmitButton
                type="submit"
                $disabled={props.isSubmitting || !formData.name.trim()}
              >
                {props.isSubmitting ? 'Сохранение...' : props.reason ? 'Сохранить' : 'Создать'}
              </Styled.ModalSubmitButton>
            </Styled.ModalButtonGroup>
          </Styled.ModalForm>
        </Styled.ModalBody>
      </Styled.ModalContainer>
    </Styled.ModalOverlay>
  )
}
