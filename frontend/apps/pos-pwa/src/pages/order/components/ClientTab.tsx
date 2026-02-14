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

  const selectedGuestData = guests.find(g => g.guestNumber === selectedGuest)

  const handleRemoveDiscount = (guestNumber: number) => {
    onRemoveDiscount(guestNumber)
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
                <Styled.GuestCardRow $highlight>
                  <Styled.GuestCardLabel>Скидка:</Styled.GuestCardLabel>
                  <Styled.GuestCardValue $highlight>
                    {guest.discount.type === DiscountType.Percentage
                      ? `${guest.discount.value}%`
                      : formatPrice(guest.discount.value)}
                    {' '}({formatPrice(guest.discount.amount)})
                  </Styled.GuestCardValue>
                </Styled.GuestCardRow>
              )}
            </Styled.GuestCardBody>
          </Styled.GuestCard>
        ))}
      </Styled.GuestsList>

      <Styled.DiscountPanel>
        {selectedGuestData && (
          <Styled.DiscountPanelEmpty>
            Скидки управляются через выбранного клиента
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
