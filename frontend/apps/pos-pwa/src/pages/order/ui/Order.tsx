import * as Styled from './styled'
import { useOrder } from '../hooks/useOrder'
import { OrderTab, DiscountType } from '../model/enums'
import { useCurrentUser } from '@restaurant-pos/api-client'
import type { MenuItem } from '../model/types'
import { ClientTab } from '../components/ClientTab'
import { CustomerSelector } from '../components/CustomerSelector'

const CATEGORY_ICONS: Record<string, string> = {
  coffee: '☕',
  bakery: '🥐',
  drinks: '🥤',
  dishes: '🍽️',
  default: '📦',
}

function getCategoryIcon(categoryName: string): string {
  const lowerName = categoryName.toLowerCase()
  if (lowerName.includes('кофе') || lowerName.includes('coffee')) return CATEGORY_ICONS.coffee
  if (lowerName.includes('выпеч') || lowerName.includes('bakery')) return CATEGORY_ICONS.bakery
  if (lowerName.includes('напит') || lowerName.includes('drink')) return CATEGORY_ICONS.drinks
  if (lowerName.includes('блюд')) return CATEGORY_ICONS.dishes
  return CATEGORY_ICONS.default
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function Order() {
  const { data: currentUser } = useCurrentUser()
  const {
    orderData,
    categories,
    products,
    technicalCards,
    selectedCategoryId,
    selectedTab,
    isLoading,
    isLoadingCategories,
    selectedGuest,
    selectedCategoryItems,
    handleBack,
    handleCategorySelect,
    handleProductClick,
    handleTechCardClick,
    handleGuestSelect,
    handleAddGuest,
    handleQuantityChange,
    handleRemoveItem,
    handleTabChange,
    handlePayment,
    handleSetGuestDiscount,
    handleRemoveGuestDiscount,
    handleCustomerSelect,
    handleCustomerRemove,
    checkAllItemsExcluded,
    getItemPromotionBadge,
    getItemIneligibilityReason,
    isPromotionsModalOpen,
    openPromotionsModal,
    closePromotionsModal,
    activePromotions,
  } = useOrder()

  const userName = currentUser?.name || 'Maki'

  // Обработчик клика на товар или тех-карту
  const handleItemClick = (item: MenuItem) => {
    if ('itemType' in item) {
      if (item.itemType === 'tech_card') {
        handleTechCardClick(item as any)
      } else {
        handleProductClick(item as any)
      }
    } else {
      // Fallback - пытаемся определить по наличию специфических полей
      handleProductClick(item as any)
    }
  }

  if (isLoading || isLoadingCategories) {
    return (
      <Styled.Container>
        <Styled.Header>
          <Styled.HeaderLeft onClick={handleBack}>
            <Styled.BackIcon />
          </Styled.HeaderLeft>
          <Styled.HeaderCenter>
            <span>Загрузка...</span>
          </Styled.HeaderCenter>
          <Styled.HeaderRight />
        </Styled.Header>
        <Styled.MainContent>
          <Styled.LoadingSpinner>Загрузка данных...</Styled.LoadingSpinner>
        </Styled.MainContent>
      </Styled.Container>
    )
  }

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.HeaderLeft onClick={handleBack}>
          <Styled.MenuIcon />
          <span>Главное меню</span>
        </Styled.HeaderLeft>
        <Styled.HeaderCenter>
          <Styled.CheckDropdown>
            Чек №<Styled.DropdownIcon />
          </Styled.CheckDropdown>
          <Styled.TableInfo>
            {orderData?.tableNumber ? `Стол ${orderData.tableNumber}` : 'Стол не выбран'}
          </Styled.TableInfo>
        </Styled.HeaderCenter>
        <Styled.HeaderRight>
          <Styled.MenuIcon />
          <Styled.HeaderUserName>{userName}</Styled.HeaderUserName>
          <Styled.StatusIndicator />
        </Styled.HeaderRight>
      </Styled.Header>

      <Styled.MainContent>
        <Styled.LeftPanel>
          <Styled.Tabs>
            <Styled.Tab
              $active={selectedTab === OrderTab.Check}
              onClick={() => handleTabChange(OrderTab.Check)}
            >
              Чек
            </Styled.Tab>
            <Styled.Tab
              $active={selectedTab === OrderTab.Client}
              onClick={() => handleTabChange(OrderTab.Client)}
            >
              Клиент
            </Styled.Tab>
          </Styled.Tabs>

          <Styled.PanelContent>
            {selectedTab === OrderTab.Check ? (
              <>
                <CustomerSelector
                  selectedCustomer={selectedGuest?.customer}
                  onCustomerSelect={handleCustomerSelect}
                  onCustomerRemove={handleCustomerRemove}
                />

                <Styled.GuestSection>
              <Styled.GuestHeader>
                <Styled.GuestTitle>
                  {selectedGuest?.customer?.name || `ГОСТЬ ${orderData?.selectedGuestNumber || 1}`}
                </Styled.GuestTitle>
                <Styled.AddGuestButton onClick={handleAddGuest}>
                  <Styled.PersonIcon />
                  ДОБАВИТЬ ГОСТЯ
                </Styled.AddGuestButton>
              </Styled.GuestHeader>
              <Styled.GuestList>
                {orderData?.guests.map(guest => (
                  <Styled.GuestChip
                    key={guest.guestNumber}
                    $selected={guest.guestNumber === orderData.selectedGuestNumber}
                    onClick={() => handleGuestSelect(guest.guestNumber)}
                  >
                    {guest.customer?.name || `Гость ${guest.guestNumber}`}
                  </Styled.GuestChip>
                ))}
              </Styled.GuestList>
              <Styled.GuestInfoText>
                Выберите этого гостя, чтобы добавить товары в его заказ
              </Styled.GuestInfoText>
            </Styled.GuestSection>

            <Styled.OrderItemsList>
              {selectedGuest?.items.length === 0 ? (
                <Styled.EmptyItems>
                  <Styled.EmptyItemsText>
                    Добавьте товары в заказ
                  </Styled.EmptyItemsText>
                </Styled.EmptyItems>
              ) : (
                <>
                  {selectedGuest?.items.map(item => {
                    const isExcluded = item.product?.exclude_from_discounts || item.techCard?.exclude_from_discounts || false
                    const reason = item.product
                      ? getItemIneligibilityReason(item.product as any)
                      : item.techCard
                        ? getItemIneligibilityReason(item.techCard as any)
                        : null
                    return (
                      <Styled.OrderItemCard key={item.id} $excluded={isExcluded}>
                        <Styled.ItemInfo>
                          <Styled.ItemName>
                            {item.product?.name || item.techCard?.name || 'Товар'}
                            {isExcluded && <Styled.ExcludedBadge title={reason || 'Без скидки'}>Без скидки</Styled.ExcludedBadge>}
                          </Styled.ItemName>
                          {reason && <Styled.ItemMetaReason>{reason}</Styled.ItemMetaReason>}
                          <Styled.ItemPrice>{formatPrice(item.price)} / шт</Styled.ItemPrice>
                        </Styled.ItemInfo>
                        <Styled.ItemQuantity>
                          <Styled.QuantityButton
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <Styled.RemoveIcon />
                          </Styled.QuantityButton>
                          <Styled.QuantityValue>{item.quantity}</Styled.QuantityValue>
                          <Styled.QuantityButton
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <Styled.AddIcon />
                          </Styled.QuantityButton>
                          <Styled.DeleteIcon onClick={() => handleRemoveItem(item.id)} />
                        </Styled.ItemQuantity>
                        <Styled.ItemTotal>
                          {formatPrice(item.totalPrice)}
                        </Styled.ItemTotal>
                      </Styled.OrderItemCard>
                    )
                  })}
                </>
              )}
            </Styled.OrderItemsList>

            <Styled.CheckoutPanel>
              {selectedGuest && selectedGuest.discount.type !== DiscountType.None && checkAllItemsExcluded(selectedGuest.items).length > 0 && (
                <Styled.ExcludedInfo>
                  <Styled.ExcludedIcon>⚠️</Styled.ExcludedIcon>
                  <Styled.ExcludedText>
                    {checkAllItemsExcluded(selectedGuest.items).length} товар(ов) не участвуют в скидке
                  </Styled.ExcludedText>
                </Styled.ExcludedInfo>
              )}

              {selectedGuest && selectedGuest.discount.type !== DiscountType.None && selectedGuest.discount.amount > 0 ? (
                <>
                  <Styled.CheckoutRow>
                    <Styled.CheckoutLabel>Сумма</Styled.CheckoutLabel>
                    <Styled.CheckoutAmount>
                      {formatPrice(selectedGuest.totalAmount || 0)}
                    </Styled.CheckoutAmount>
                  </Styled.CheckoutRow>
                  <Styled.CheckoutRow $discount>
                    <Styled.CheckoutLabel>Скидка: {selectedGuest.discount.type === DiscountType.Percentage ? `${selectedGuest.discount.value}%` : formatPrice(selectedGuest.discount.value)}</Styled.CheckoutLabel>
                    <Styled.CheckoutAmount $discount>
                      - {formatPrice(selectedGuest.discount.amount)}
                    </Styled.CheckoutAmount>
                  </Styled.CheckoutRow>
                  <Styled.CheckoutRow>
                    <Styled.CheckoutLabel>К оплате</Styled.CheckoutLabel>
                    <Styled.CheckoutAmount style={{ fontWeight: 600, fontSize: '1.2em' }}>
                      {formatPrice(selectedGuest.finalAmount || 0)}
                    </Styled.CheckoutAmount>
                  </Styled.CheckoutRow>
                </>
              ) : (
                <Styled.CheckoutRow>
                  <Styled.CheckoutLabel>К оплате</Styled.CheckoutLabel>
                  <Styled.CheckoutAmount>
                    {formatPrice(selectedGuest?.totalAmount || 0)}
                  </Styled.CheckoutAmount>
                </Styled.CheckoutRow>
              )}

              <Styled.CheckoutActions>
                <Styled.CheckoutButton $variant="icon">
                  <Styled.MoreIcon />
                </Styled.CheckoutButton>
                <Styled.CheckoutButton $variant="icon">
                  <Styled.PrintIcon />
                </Styled.CheckoutButton>
                <Styled.CheckoutButton
                  $variant="primary"
                  onClick={handlePayment}
                  disabled={!orderData?.finalAmount}
                >
                  Оплатить
                </Styled.CheckoutButton>
              </Styled.CheckoutActions>
            </Styled.CheckoutPanel>
              </>
            ) : (
              <ClientTab
                guests={orderData?.guests || []}
                onSetDiscount={handleSetGuestDiscount}
                onRemoveDiscount={handleRemoveGuestDiscount}
              />
            )}
          </Styled.PanelContent>
        </Styled.LeftPanel>

        <Styled.RightPanel>
          <Styled.ProductsHeader>
            {!selectedCategoryId ? (
              <Styled.ProductsTitle>Все товары</Styled.ProductsTitle>
            ) : (
              <Styled.HeaderLeft onClick={() => handleCategorySelect('')} style={{ gap: '4px' }}>
                <Styled.BackIcon />
                <Styled.ProductsTitle>
                  {categories.find(c => c.id === selectedCategoryId)?.name || 'Категория'}
                </Styled.ProductsTitle>
              </Styled.HeaderLeft>
            )}
            <Styled.ProductsActions>
              <Styled.ActionButton>
                <Styled.SearchIcon />
              </Styled.ActionButton>
              <Styled.ActionButton>
                <Styled.BarcodeIcon />
              </Styled.ActionButton>
              <Styled.ActionButton onClick={openPromotionsModal}>Акции</Styled.ActionButton>
            </Styled.ProductsActions>
          </Styled.ProductsHeader>

          {!selectedCategoryId ? (
            <Styled.CategoriesGrid>
              {categories.map(category => (
                <Styled.CategoryCard
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <Styled.CategoryIcon>
                    {getCategoryIcon(category.name)}
                  </Styled.CategoryIcon>
                  <Styled.CategoryName>{category.name}</Styled.CategoryName>
                </Styled.CategoryCard>
              ))}
            </Styled.CategoriesGrid>
          ) : (
            <Styled.ProductsGrid>
              {selectedCategoryItems.length === 0 ? (
                <Styled.EmptyItems>
                  <Styled.EmptyItemsText>
                    В этой категории нет товаров
                  </Styled.EmptyItemsText>
                </Styled.EmptyItems>
              ) : (
                selectedCategoryItems.map(item => {
                  const promotionBadge = getItemPromotionBadge(item)
                  const reason = getItemIneligibilityReason(item)

                  return (
                    <Styled.ProductCard
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                    >
                      <Styled.ProductBadges>
                        {item.exclude_from_discounts && (
                          <Styled.ProductBadge $variant="excluded" title={reason || 'Без скидки'}>Без скидки</Styled.ProductBadge>
                        )}
                        {!item.exclude_from_discounts && promotionBadge && (
                          <Styled.ProductBadge $variant="promo">
                            {promotionBadge}
                          </Styled.ProductBadge>
                        )}
                      </Styled.ProductBadges>
                      <Styled.ProductImage>
                        {item.cover_image ? (
                          <img
                            src={item.cover_image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        ) : (
                          <span>🍽️</span>
                        )}
                      </Styled.ProductImage>
                      <Styled.ProductName>{item.name}</Styled.ProductName>
                      {reason && <Styled.ItemMetaReason title={reason}>{reason}</Styled.ItemMetaReason>}
                      <Styled.ProductPrice>{formatPrice(item.price)}</Styled.ProductPrice>
                    </Styled.ProductCard>
                  )
                })
              )}
            </Styled.ProductsGrid>
          )}
        </Styled.RightPanel>
      </Styled.MainContent>

      {isPromotionsModalOpen && (
        <>
          <Styled.Overlay onClick={closePromotionsModal} />
          <Styled.PromotionsModal>
            <Styled.PromotionsModalHeader>
              <Styled.PromotionsTitle>Акции заведения</Styled.PromotionsTitle>
              <Styled.CloseModalButton onClick={closePromotionsModal}>×</Styled.CloseModalButton>
            </Styled.PromotionsModalHeader>
            <Styled.PromotionsList>
              {activePromotions.length === 0 && (
                <Styled.PromotionsEmpty>Сейчас нет активных акций</Styled.PromotionsEmpty>
              )}
              {activePromotions.map((promotion) => (
                <Styled.PromotionCard key={promotion.id}>
                  <Styled.PromotionName>{promotion.name}</Styled.PromotionName>
                  {promotion.description && (
                    <Styled.PromotionDescription>{promotion.description}</Styled.PromotionDescription>
                  )}
                  <Styled.PromotionMeta>
                    Тип: {promotion.type}
                  </Styled.PromotionMeta>
                  <Styled.PromotionMeta>
                    Условия: {promotion.discount_percentage ? `${promotion.discount_percentage}%` : 'по правилам акции'}
                  </Styled.PromotionMeta>
                </Styled.PromotionCard>
              ))}
            </Styled.PromotionsList>
          </Styled.PromotionsModal>
        </>
      )}
    </Styled.Container>
  )
}
