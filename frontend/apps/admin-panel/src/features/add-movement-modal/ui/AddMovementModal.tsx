import { useAddMovementModal } from '../hooks/useAddMovementModal'
import type { AddMovementModalProps } from '../model/types'
import { MovementForm } from './components/MovementForm'
import * as Styled from './styled'

export const AddMovementModal = (props: AddMovementModalProps) => {
  const {
    formData,
    isSubmitting,
    error,
    fieldErrors,
    isFormValid,
    warehouses,
    availableItems,
    totalAmount,
    handleFieldChange,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    handleClose,
  } = useAddMovementModal(props)

  if (!props.isOpen) {
    return null
  }

  return (
    <Styled.Overlay $isOpen={props.isOpen} onClick={handleClose} aria-hidden={!props.isOpen}>
      <Styled.ModalContainer onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <Styled.ModalHeader>
          <Styled.ModalTitle id="modal-title">Перемещение товаров</Styled.ModalTitle>
          <Styled.CloseButton onClick={handleClose}>×</Styled.CloseButton>
        </Styled.ModalHeader>

        <Styled.ModalBody>
          {error && <Styled.ErrorAlert>{error}</Styled.ErrorAlert>}

          <form onSubmit={handleSubmit}>
            <Styled.FormContainer>
              <Styled.FormSection>
                <Styled.FormRow>
                  <Styled.FormField>
                    <Styled.Label>Дата и время перемещения</Styled.Label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Styled.Input
                        type="date"
                        value={formData.movement_date}
                        onChange={(e) => handleFieldChange('movement_date', e.target.value)}
                      />
                      <Styled.TimeInputs>
                        <Styled.TimeInput
                          type="text"
                          value={formData.movement_time_hours}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                            if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                              handleFieldChange('movement_time_hours', value)
                            }
                          }}
                          placeholder="00"
                          maxLength={2}
                        />
                        <Styled.TimeSeparator>:</Styled.TimeSeparator>
                        <Styled.TimeInput
                          type="text"
                          value={formData.movement_time_minutes}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                            if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                              handleFieldChange('movement_time_minutes', value)
                            }
                          }}
                          placeholder="00"
                          maxLength={2}
                        />
                      </Styled.TimeInputs>
                    </div>
                  </Styled.FormField>
                </Styled.FormRow>

                <Styled.FormRow>
                  <Styled.FormField>
                    <Styled.Label>Со склада</Styled.Label>
                    <Styled.Select
                      value={formData.from_warehouse_id}
                      onChange={(e) => handleFieldChange('from_warehouse_id', e.target.value)}
                    >
                      <option value="">Выберите склад</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </Styled.Select>
                    {fieldErrors.from_warehouse_id && (
                      <Styled.ErrorMessage>{fieldErrors.from_warehouse_id}</Styled.ErrorMessage>
                    )}
                  </Styled.FormField>

                  <Styled.FormField>
                    <Styled.Label>На склад</Styled.Label>
                    <Styled.Select
                      value={formData.to_warehouse_id}
                      onChange={(e) => handleFieldChange('to_warehouse_id', e.target.value)}
                    >
                      <option value="">Выберите склад</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </Styled.Select>
                    {fieldErrors.to_warehouse_id && (
                      <Styled.ErrorMessage>{fieldErrors.to_warehouse_id}</Styled.ErrorMessage>
                    )}
                  </Styled.FormField>
                </Styled.FormRow>

                <Styled.FormField>
                  <Styled.Label>Комментарий</Styled.Label>
                  <Styled.Textarea
                    value={formData.comment}
                    onChange={(e) => handleFieldChange('comment', e.target.value)}
                    placeholder="Введите комментарий..."
                  />
                </Styled.FormField>
              </Styled.FormSection>

              <Styled.FormSection>
                <MovementForm
                  formData={formData}
                  fieldErrors={fieldErrors}
                  isSubmitting={isSubmitting}
                  warehouses={warehouses}
                  availableItems={availableItems}
                  totalAmount={totalAmount}
                  handleFieldChange={handleFieldChange}
                  addItem={addItem}
                  removeItem={removeItem}
                  updateItem={updateItem}
                />
              </Styled.FormSection>
            </Styled.FormContainer>
          </form>
        </Styled.ModalBody>

        <Styled.Footer>
          <Styled.SaveButton onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Styled.SaveButton>
          <Styled.Summary>
            <Styled.SummaryRow>
              <Styled.SummaryLabel>Итого</Styled.SummaryLabel>
              <Styled.SummaryValue>{totalAmount.toFixed(2)} ₽</Styled.SummaryValue>
            </Styled.SummaryRow>
          </Styled.Summary>
        </Styled.Footer>
      </Styled.ModalContainer>
    </Styled.Overlay>
  )
}

