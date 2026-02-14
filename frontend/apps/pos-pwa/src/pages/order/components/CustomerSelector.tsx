import { useState, useMemo } from 'react'
import { useCustomers, useCustomerGroups, type Customer } from '@restaurant-pos/api-client'
import * as Styled from '../ui/styled'

interface CustomerSelectorProps {
  selectedCustomer: Customer | null | undefined
  onCustomerSelect: (customer: Customer | null) => void
  onCustomerRemove: () => void
}

export function CustomerSelector({ selectedCustomer, onCustomerSelect, onCustomerRemove }: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const { customers } = useCustomers()
  const { customerGroups } = useCustomerGroups()

  // Filter customers by search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return customers.filter(customer => {
      const matchesName = customer.name?.toLowerCase().includes(query)
      const matchesPhone = customer.phone?.toLowerCase().includes(query)
      const matchesEmail = customer.email?.toLowerCase().includes(query)
      return matchesName || matchesPhone || matchesEmail
    })
  }, [customers, searchQuery])

  const handleSelectCustomer = (customer: Customer) => {
    onCustomerSelect(customer)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleRemove = () => {
    onCustomerRemove()
    setIsOpen(false)
  }

  return (
    <Styled.CustomerSelectorContainer>
      {selectedCustomer ? (
        <Styled.SelectedCustomerCard>
          <Styled.SelectedCustomerInfo>
            <Styled.SelectedCustomerName>{selectedCustomer.name}</Styled.SelectedCustomerName>
            {selectedCustomer.phone && (
              <Styled.SelectedCustomerPhone>{selectedCustomer.phone}</Styled.SelectedCustomerPhone>
            )}
            {selectedCustomer.group && (
              <Styled.SelectedCustomerGroup>
                Группа: {selectedCustomer.group.name}
                {selectedCustomer.group.discount_percentage > 0 && (
                  <Styled.DiscountBadge>
                    -{selectedCustomer.group.discount_percentage}%
                  </Styled.DiscountBadge>
                )}
              </Styled.SelectedCustomerGroup>
            )}
          </Styled.SelectedCustomerInfo>
          <Styled.RemoveCustomerButton onClick={handleRemove}>
            ×
          </Styled.RemoveCustomerButton>
        </Styled.SelectedCustomerCard>
      ) : (
        <Styled.CustomerSearchButton onClick={() => setIsOpen(true)}>
          <Styled.SearchIcon>🔍</Styled.SearchIcon>
          <Styled.SearchButtonText>
            {selectedCustomer ? 'Изменить клиента' : 'Выбрать клиента'}
          </Styled.SearchButtonText>
        </Styled.CustomerSearchButton>
      )}

      {isOpen && !selectedCustomer && (
        <Styled.CustomerSearchModal onClick={(e) => e.stopPropagation()}>
          <Styled.SearchHeader>
            <Styled.SearchInput
              type="text"
              placeholder="Поиск по имени, телефону или email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Styled.CloseSearchButton onClick={() => setIsOpen(false)}>
              ×
            </Styled.CloseSearchButton>
          </Styled.SearchHeader>

          <Styled.CustomerList>
            {filteredCustomers.length === 0 ? (
              <Styled.EmptySearchResult>
                Нет клиентов по запросу "{searchQuery}"
              </Styled.EmptySearchResult>
            ) : (
              filteredCustomers.map(customer => (
                <Styled.CustomerListItem
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <Styled.CustomerListItemMain>
                    <Styled.CustomerListItemName>{customer.name}</Styled.CustomerListItemName>
                    {customer.phone && (
                      <Styled.CustomerListItemPhone>{customer.phone}</Styled.CustomerListItemPhone>
                    )}
                  </Styled.CustomerListItemMain>
                  {customer.group && (
                    <Styled.CustomerListGroup>
                      {customer.group.name}
                      {customer.group.discount_percentage > 0 && (
                        <Styled.SmallDiscountBadge>-{customer.group.discount_percentage}%</Styled.SmallDiscountBadge>
                      )}
                    </Styled.CustomerListGroup>
                  )}
                </Styled.CustomerListItem>
              ))
            )}
          </Styled.CustomerList>
        </Styled.CustomerSearchModal>
      )}

      {isOpen && (
        <Styled.Overlay onClick={() => setIsOpen(false)} />
      )}
    </Styled.CustomerSelectorContainer>
  )
}
