import { useOnboardingForm } from '../hooks/useOnboardingForm'
import type { OnboardingFormProps } from '../model/types'
import { Button } from '@restaurant-pos/ui'
import * as Styled from './styled'

export const OnboardingForm = (props: OnboardingFormProps) => {
  const {
    establishment_name,
    address,
    phone,
    email,
    type,
    has_seating_places,
    table_count,
    has_takeaway,
    has_delivery,
    isLoading,
    error,
    handleEstablishmentNameChange,
    handleAddressChange,
    handlePhoneChange,
    handleEmailChange,
    handleTypeChange,
    handleHasSeatingPlacesChange,
    handleTableCountChange,
    handleHasTakeawayChange,
    handleHasDeliveryChange,
    handleSubmit,
  } = useOnboardingForm(props)

  return (
    <Styled.Form onSubmit={handleSubmit}>
      <Styled.InputGroup>
        <Styled.Label htmlFor="establishment_name">
          Название заведения *
        </Styled.Label>
        <Styled.Input
          id="establishment_name"
          type="text"
          value={establishment_name}
          onChange={(e) => handleEstablishmentNameChange(e.target.value)}
          placeholder="Введите название заведения"
          disabled={isLoading}
          required
        />
      </Styled.InputGroup>

      <Styled.InputGroup>
        <Styled.Label htmlFor="address">Адрес *</Styled.Label>
        <Styled.Input
          id="address"
          type="text"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Введите адрес"
          disabled={isLoading}
          required
        />
      </Styled.InputGroup>

      <Styled.FormRow>
        <Styled.InputGroup>
          <Styled.Label htmlFor="phone">Телефон *</Styled.Label>
          <Styled.Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+7 999 123-45-67"
            disabled={isLoading}
            required
          />
        </Styled.InputGroup>

        <Styled.InputGroup>
          <Styled.Label htmlFor="email">Email *</Styled.Label>
          <Styled.Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="email@example.com"
            disabled={isLoading}
            required
          />
        </Styled.InputGroup>
      </Styled.FormRow>

      <Styled.InputGroup>
        <Styled.Label htmlFor="type">Тип заведения *</Styled.Label>
        <Styled.Select
          id="type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
          disabled={isLoading}
          required
        >
          <option value="restaurant">Ресторан</option>
          <option value="cafe">Кафе</option>
          <option value="bar">Бар</option>
          <option value="fast_food">Фастфуд</option>
          <option value="pizzeria">Пиццерия</option>
          <option value="other">Другое</option>
        </Styled.Select>
      </Styled.InputGroup>

      <Styled.CheckboxGroup>
        <Styled.Checkbox
          id="has_seating_places"
          type="checkbox"
          checked={has_seating_places}
          onChange={(e) => handleHasSeatingPlacesChange(e.target.checked)}
          disabled={isLoading}
        />
        <Styled.CheckboxLabel htmlFor="has_seating_places">
          Есть посадочные места
        </Styled.CheckboxLabel>
      </Styled.CheckboxGroup>

      {has_seating_places && (
        <Styled.InputGroup>
          <Styled.Label htmlFor="table_count">Количество столов</Styled.Label>
          <Styled.Input
            id="table_count"
            type="number"
            min="1"
            value={table_count}
            onChange={(e) =>
              handleTableCountChange(parseInt(e.target.value, 10) || 0)
            }
            disabled={isLoading}
            required={has_seating_places}
          />
        </Styled.InputGroup>
      )}

      <Styled.CheckboxGroup>
        <Styled.Checkbox
          id="has_takeaway"
          type="checkbox"
          checked={has_takeaway}
          onChange={(e) => handleHasTakeawayChange(e.target.checked)}
          disabled={isLoading}
        />
        <Styled.CheckboxLabel htmlFor="has_takeaway">
          Есть навынос
        </Styled.CheckboxLabel>
      </Styled.CheckboxGroup>

      <Styled.CheckboxGroup>
        <Styled.Checkbox
          id="has_delivery"
          type="checkbox"
          checked={has_delivery}
          onChange={(e) => handleHasDeliveryChange(e.target.checked)}
          disabled={isLoading}
        />
        <Styled.CheckboxLabel htmlFor="has_delivery">
          Есть доставка
        </Styled.CheckboxLabel>
      </Styled.CheckboxGroup>

      {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}

      <Styled.ButtonGroup>
        <Button htmlType="submit" disabled={isLoading}>
          {isLoading ? 'Отправка...' : 'Отправить'}
        </Button>
      </Styled.ButtonGroup>
    </Styled.Form>
  )
}

