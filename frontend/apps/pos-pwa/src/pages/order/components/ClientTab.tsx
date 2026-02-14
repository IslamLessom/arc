import { useState } from 'react'
import * as Styled from '../ui/styled'
import { DiscountType } from '../model/enums'
import type { GuestOrder } from '../model/types'

interface ClientTabProps {
  guests: GuestOrder[]
  onSetDiscount: (guestNumber: number, type: DiscountType, value: number) => void
  onRemoveDiscount: (guestNumber: number) => void
}

export function ClientTab({ guests, onSetDiscount, onRemoveDiscount }: ClientTabProps) {
  const [selectedGuest, setSelectedGuest] = useState<number | null>(null)
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.Percentage)
  const [discountValue, setDiscountValue] = useState('')

  const selectedGuestData = guests.find(g => g.guestNumber === selectedGuest)

  const handleApplyDiscount = () => {
    if (!selectedGuest) return

    const value = parseFloat(discountValue)
    if (isNaN(value) || value <= 0) return

    if (discountType === DiscountType.Percentage && value > 100) return

    onSetDiscount(selectedGuest, discountType, value)
    setDiscountValue('')
  }

  const handleRemoveDiscount = (guestNumber: number) => {
    onRemoveDiscount(guestNumber)
    if (selectedGuest === guestNumber) {
      setDiscountValue('')
    }
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const totalOrderAmount = guests.reduce((sum, g) => sum + g.totalAmount, 0)
  const totalOrderDiscount = guests.reduce((sum, g) => sum + g.discount.amount, 0)
  const totalFinalAmount = guests.reduce((sum, g) => sum + g.finalAmount, 0)

  return (
    <Styled.ClientTabContainer>
      <Styled.GuestsList>
        <Styled.GuestsListHeader>
          <Styled.GuestsListTitle>Гости</Styled.GuestsListTitle>
          <Styled.GuestsListSubtitle>
            Всего гостей: {guests.length}
          </Styled.GuestsListSubtitle>
        </Styled.GuestsListHeader>

        {guests.map(guest => (
          <Styled.GuestCard
            key={guest.guestNumber}
            $selected={selectedGuest === guest.guestNumber}
            onClick={() => setSelectedGuest(guest.guestNumber)}
          >
            <Styled.GuestCardHeader>
              <Styled.GuestCardTitle>
                Гость {guest.guestNumber}
              </Styled.GuestCardTitle>
              <Styled.GuestCardAmount>
                {formatPrice(guest.finalAmount)}
              </Styled.GuestCardAmount>
            </Styled.GuestCardHeader>

            <Styled.GuestCardBody>
              <Styled.GuestCardRow>
                <Styled.GuestCardLabel>Товаров:</Styled.GuestCardLabel>
                <Styled.GuestCardValue>{guest.items.length}</Styled.GuestCardValue>
              </Styled.GuestCardRow>

              <Styled.GuestCardRow>
                <Styled.GuestCardLabel>Сумма:</Styled.GuestCardLabel>
                <Styled.GuestCardValue>{formatPrice(guest.totalAmount)}</Styled.GuestCardValue>
              </Styled.GuestCardRow>

              {guest.discount.type !== DiscountType.None && (
                <>
                  <Styled.GuestCardRow $highlight>
                    <Styled.GuestCardLabel>Скидка:</Styled.GuestCardLabel>
                    <Styled.GuestCardValue $highlight>
                      {guest.discount.type === DiscountType.Percentage
                        ? `${guest.discount.value}%`
                        : formatPrice(guest.discount.value)}
                      {' '}({formatPrice(guest.discount.amount)})
                    </Styled.GuestCardValue>
                  </Styled.GuestCardRow>

                  <Styled.RemoveDiscountButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveDiscount(guest.guestNumber)
                    }}
                  >
                    Удалить скидку
                  </Styled.RemoveDiscountButton>
                </>
              )}
            </Styled.GuestCardBody>
          </Styled.GuestCard>
        ))}
      </Styled.GuestsList>

      <Styled.DiscountPanel>
        {selectedGuestData ? (
          <>
            <Styled.DiscountPanelHeader>
              <Styled.DiscountPanelTitle>
                Скидка для Гостя {selectedGuestData.guestNumber}
              </Styled.DiscountPanelTitle>
            </Styled.DiscountPanelHeader>

            <Styled.DiscountForm>
              <Styled.DiscountTypeSelector>
                <Styled.DiscountTypeButton
                  $active={discountType === DiscountType.Percentage}
                  onClick={() => setDiscountType(DiscountType.Percentage)}
                >
                  Процент
                </Styled.DiscountTypeButton>
                <Styled.DiscountTypeButton
                  $active={discountType === DiscountType.Fixed}
                  onClick={() => setDiscountType(DiscountType.Fixed)}
                >
                  Сумма
                </Styled.DiscountTypeButton>
              </Styled.DiscountTypeSelector>

              <Styled.DiscountInputWrapper>
                <Styled.DiscountInput
                  type="number"
                  placeholder={discountType === DiscountType.Percentage ? '0' : '0 ₽'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  min={0}
                  max={discountType === DiscountType.Percentage ? 100 : undefined}
                  step={discountType === DiscountType.Percentage ? 1 : 0.01}
                />
                <Styled.DiscountInputSuffix>
                  {discountType === DiscountType.Percentage ? '%' : '₽'}
                </Styled.DiscountInputSuffix>
              </Styled.DiscountInputWrapper>

              <Styled.ApplyDiscountButton onClick={handleApplyDiscount}>
                Применить
              </Styled.ApplyDiscountButton>
            </Styled.DiscountForm>

            <Styled.DiscountPreview>
              {discountType === DiscountType.Percentage && discountValue ? (
                <Styled.DiscountPreviewText>
                  Скидка составит:{' '}
                  <strong>
                    {formatPrice((selectedGuestData.totalAmount * parseFloat(discountValue)) / 100)}
                  </strong>
                </Styled.DiscountPreviewText>
              ) : discountType === DiscountType.Fixed && discountValue ? (
                <Styled.DiscountPreviewText>
                  Скидка составит:{' '}
                  <strong>{formatPrice(Math.min(parseFloat(discountValue), selectedGuestData.totalAmount))}</strong>
                </Styled.DiscountPreviewText>
              ) : null}
            </Styled.DiscountPreview>
          </>
        ) : (
          <Styled.DiscountPanelEmpty>
            Выберите гостя, чтобы применить скидку
          </Styled.DiscountPanelEmpty>
        )}
      </Styled.DiscountPanel>

      <Styled.OrderSummary>
        <Styled.SummaryRow>
          <Styled.SummaryLabel>Итого по чеку:</Styled.SummaryLabel>
          <Styled.SummaryValue>{formatPrice(totalOrderAmount)}</Styled.SummaryValue>
        </Styled.SummaryRow>
        <Styled.SummaryRow>
          <Styled.SummaryLabel>Общая скидка:</Styled.SummaryLabel>
          <Styled.SummaryValue $discount>- {formatPrice(totalOrderDiscount)}</Styled.SummaryValue>
        </Styled.SummaryRow>
        <Styled.SummaryRow $total>
          <Styled.SummaryLabel $total>К оплате:</Styled.SummaryLabel>
          <Styled.SummaryValue $total>{formatPrice(totalFinalAmount)}</Styled.SummaryValue>
        </Styled.SummaryRow>
      </Styled.OrderSummary>
    </Styled.ClientTabContainer>
  )
}
