import styled from 'styled-components'
import {
  MdMenu,
  MdArrowBack,
  MdPersonAdd,
  MdSearch,
  MdBarcodeReader,
  MdMoreVert,
  MdPrint,
  MdAdd,
  MdRemove,
  MdDelete,
  MdKeyboardArrowDown,
} from 'react-icons/md'

// ===== Icons =====
export const MenuIcon = styled(MdMenu)({
  fontSize: '24px',
  cursor: 'pointer',
})

export const BackIcon = styled(MdArrowBack)({
  fontSize: '24px',
  cursor: 'pointer',
})

export const PersonIcon = styled(MdPersonAdd)({
  fontSize: '18px',
})

export const SearchIcon = styled(MdSearch)({
  fontSize: '20px',
  color: '#666666',
})

export const BarcodeIcon = styled(MdBarcodeReader)({
  fontSize: '20px',
  color: '#666666',
})

export const MoreIcon = styled(MdMoreVert)({
  fontSize: '24px',
  cursor: 'pointer',
})

export const PrintIcon = styled(MdPrint)({
  fontSize: '20px',
  cursor: 'pointer',
})

export const AddIcon = styled(MdAdd)({
  fontSize: '16px',
})

export const RemoveIcon = styled(MdRemove)({
  fontSize: '16px',
})

export const DeleteIcon = styled(MdDelete)({
  fontSize: '18px',
  cursor: 'pointer',
  color: '#e74c3c',
})

export const DropdownIcon = styled(MdKeyboardArrowDown)({
  fontSize: '20px',
  marginLeft: '4px',
})

// ===== Main Container =====
export const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: '#f5f6f7',
})

// ===== Header =====
export const Header = styled.header({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: '#2c3e50',
  color: '#ffffff',
  minHeight: '56px',
})

export const HeaderLeft = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
})

export const HeaderCenter = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
})

export const CheckDropdown = styled.div({
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  cursor: 'pointer',
})

export const TableInfo = styled.span({
  fontSize: '12px',
  opacity: 0.8,
})

export const HeaderRight = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
})

export const StatusIndicator = styled.div({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#27ae60',
})

export const HeaderUserName = styled.span({
  fontSize: '14px',
})

// ===== Main Content =====
export const MainContent = styled.div({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
})

// ===== Left Panel (Order Management) =====
export const LeftPanel = styled.div({
  width: '40%',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid #e0e0e0',
})

export const Tabs = styled.div({
  display: 'flex',
  borderBottom: '1px solid #e0e0e0',
})

export const Tab = styled.button<{ $active: boolean }>((props) => ({
  flex: 1,
  padding: '12px 16px',
  backgroundColor: props.$active ? '#ffffff' : '#ecf0f1',
  color: props.$active ? '#2c3e50' : '#7f8c8d',
  border: 'none',
  borderBottom: props.$active ? '2px solid #3498db' : 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: props.$active ? 600 : 400,
  transition: 'all 0.2s',
}))

export const PanelContent = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
})

export const GuestSection = styled.div({
  padding: '16px',
  borderBottom: '1px solid #e0e0e0',
})

export const GuestHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
})

export const GuestTitle = styled.div({
  fontSize: '14px',
  fontWeight: 600,
  color: '#3498db',
  textTransform: 'uppercase',
})

export const AddGuestButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  backgroundColor: '#3498db',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#2980b9',
  },
})

export const GuestList = styled.div({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
})

export const GuestChip = styled.button<{ $selected: boolean }>((props) => ({
  padding: '6px 12px',
  backgroundColor: props.$selected ? '#3498db' : '#ecf0f1',
  color: props.$selected ? '#ffffff' : '#2c3e50',
  border: 'none',
  borderRadius: '16px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: props.$selected ? 600 : 400,
  transition: 'all 0.2s',
}))

export const GuestInfoText = styled.p({
  fontSize: '12px',
  color: '#7f8c8d',
  margin: '8px 0 0 0',
})

export const OrderItemsList = styled.div({
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
})

export const OrderItemCard = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  marginBottom: '8px',
})

export const ItemInfo = styled.div({
  flex: 1,
})

export const ItemName = styled.div({
  fontSize: '14px',
  fontWeight: 500,
  color: '#2c3e50',
  marginBottom: '4px',
})

export const ItemPrice = styled.div({
  fontSize: '12px',
  color: '#7f8c8d',
})

export const ItemQuantity = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

export const QuantityButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  backgroundColor: '#ecf0f1',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#bdc3c7',
  },
})

export const QuantityValue = styled.span({
  fontSize: '14px',
  fontWeight: 600,
  minWidth: '24px',
  textAlign: 'center',
})

export const ItemTotal = styled.div({
  fontSize: '14px',
  fontWeight: 600,
  color: '#2c3e50',
  minWidth: '60px',
  textAlign: 'right',
})

export const EmptyItems = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#95a5a6',
})

export const EmptyItemsText = styled.p({
  fontSize: '14px',
  margin: 0,
})

export const CheckoutPanel = styled.div({
  padding: '16px',
  borderTop: '1px solid #e0e0e0',
  backgroundColor: '#ffffff',
})

export const CheckoutRow = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
})

export const CheckoutLabel = styled.span({
  fontSize: '14px',
  color: '#7f8c8d',
})

export const CheckoutAmount = styled.span({
  fontSize: '24px',
  fontWeight: 700,
  color: '#2c3e50',
})

export const CheckoutActions = styled.div({
  display: 'flex',
  gap: '8px',
})

export const CheckoutButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'icon' }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: props.$variant === 'icon' ? '10px' : '12px 20px',
  backgroundColor: props.$variant === 'primary' ? '#27ae60' : '#ecf0f1',
  color: props.$variant === 'primary' ? '#ffffff' : '#2c3e50',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: props.$variant === 'primary' ? 600 : 400,
  transition: 'background-color 0.2s',
  flex: props.$variant === 'icon' ? 'none' : 1,
  '&:hover': {
    backgroundColor: props.$variant === 'primary' ? '#229954' : '#bdc3c7',
  },
}))

// ===== Right Panel (Products) =====
export const RightPanel = styled.div({
  width: '60%',
  backgroundColor: '#ecf0f1',
  display: 'flex',
  flexDirection: 'column',
})

export const ProductsHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e0e0e0',
})

export const ProductsTitle = styled.h2({
  fontSize: '18px',
  fontWeight: 600,
  margin: 0,
  color: '#2c3e50',
})

export const ProductsActions = styled.div({
  display: 'flex',
  gap: '8px',
})

export const ActionButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  backgroundColor: '#ecf0f1',
  color: '#2c3e50',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#bdc3c7',
  },
})

export const CategoriesGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '12px',
  padding: '16px',
  overflowY: 'auto',
})

export const CategoryCard = styled.button<{ $active?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: props.$active ? '#3498db' : '#ffffff',
  border: props.$active ? '2px solid #3498db' : '2px solid transparent',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: props.$active ? '#2980b9' : '#f8f9fa',
    borderColor: props.$active ? '#2980b9' : '#3498db',
  },
}))

export const CategoryIcon = styled.div({
  width: '48px',
  height: '48px',
  backgroundColor: '#ecf0f1',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '8px',
  fontSize: '24px',
})

export const CategoryName = styled.span<{ $active?: boolean }>((props) => ({
  fontSize: '13px',
  fontWeight: 500,
  color: props.$active ? '#ffffff' : '#2c3e50',
  textAlign: 'center',
}))

export const ProductsGrid = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '12px',
  padding: '16px',
  overflowY: 'auto',
  flex: 1,
  alignContent: 'flex-start',
})

export const ProductCard = styled.button({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '16px',
  backgroundColor: '#ffffff',
  border: '2px solid transparent',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  height: 'auto',
  minHeight: '140px',
  '&:hover': {
    borderColor: '#3498db',
    backgroundColor: '#f8f9fa',
  },
})

export const ProductImage = styled.div({
  width: '64px',
  height: '64px',
  backgroundColor: '#ecf0f1',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '8px',
  fontSize: '28px',
})

export const ProductName = styled.span({
  fontSize: '13px',
  fontWeight: 500,
  color: '#2c3e50',
  textAlign: 'center',
  marginBottom: '4px',
})

export const ProductPrice = styled.span({
  fontSize: '14px',
  fontWeight: 600,
  color: '#27ae60',
})

export const LoadingSpinner = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  fontSize: '14px',
  color: '#7f8c8d',
})

// ===== ClientTab Styles =====
export const ClientTabContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: 'linear-gradient(180deg, #f4f7fb 0%, #eef2f7 100%)',
})

export const GuestsList = styled.div({
  flex: 1,
  overflowY: 'auto',
  padding: '16px 16px 8px',
})

export const GuestsListHeader = styled.div({
  marginBottom: '14px',
})

export const GuestsListTitle = styled.h3({
  fontSize: '20px',
  fontWeight: 700,
  color: '#1f2d3d',
  margin: '0 0 4px 0',
})

export const GuestsListSubtitle = styled.p({
  fontSize: '13px',
  color: '#5f6c7b',
  margin: 0,
})

export const GuestCard = styled.button<{ $selected: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: '14px 14px 12px',
  backgroundColor: props.$selected ? '#0f4c81' : '#ffffff',
  border: props.$selected ? '1px solid #0f4c81' : '1px solid #d8e0ea',
  boxShadow: props.$selected ? '0 8px 20px rgba(15, 76, 129, 0.25)' : '0 3px 10px rgba(17, 37, 62, 0.06)',
  borderRadius: '12px',
  cursor: 'pointer',
  marginBottom: '10px',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: props.$selected ? '#0f4c81' : '#9fb6cd',
    transform: 'translateY(-1px)',
  },
}))

export const GuestCardHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '10px',
})

export const GuestCardTitle = styled.span<{ $selected?: boolean }>((props) => ({
  fontSize: '15px',
  fontWeight: 700,
  color: props.$selected ? '#ffffff' : '#2c3e50',
}))

export const GuestCardAmount = styled.span<{ $selected?: boolean }>((props) => ({
  fontSize: '22px',
  fontWeight: 700,
  color: props.$selected ? '#d9f3e4' : '#1c9c5b',
}))

export const GuestCardBody = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const GuestCardRow = styled.div<{ $highlight?: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '13px',
  color: props.$highlight ? '#d43f32' : '#5e6b78',
}))

export const GuestCardLabel = styled.span({
  fontWeight: 500,
})

export const GuestCardValue = styled.span<{ $highlight?: boolean }>((props) => ({
  fontWeight: props.$highlight ? 600 : 500,
  color: props.$highlight ? '#d43f32' : '#1f2d3d',
}))

export const RemoveDiscountButton = styled.button({
  marginTop: '8px',
  padding: '6px 12px',
  backgroundColor: '#e74c3c',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#c0392b',
  },
})

export const DiscountPanel = styled.div({
  padding: '12px 16px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #dbe4ef',
  borderBottom: '1px solid #dbe4ef',
})

export const DiscountPanelHeader = styled.div({
  marginBottom: '12px',
})

export const DiscountPanelTitle = styled.h3({
  fontSize: '14px',
  fontWeight: 600,
  color: '#2c3e50',
  margin: 0,
})

export const DiscountPanelEmpty = styled.p({
  fontSize: '13px',
  color: '#5f6c7b',
  textAlign: 'center',
  margin: '10px 0',
})

export const DiscountForm = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const DiscountTypeSelector = styled.div({
  display: 'flex',
  gap: '8px',
})

export const DiscountTypeButton = styled.button<{ $active: boolean }>((props) => ({
  flex: 1,
  padding: '8px 12px',
  backgroundColor: props.$active ? '#3498db' : '#ecf0f1',
  color: props.$active ? '#ffffff' : '#2c3e50',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: props.$active ? 600 : 400,
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: props.$active ? '#2980b9' : '#bdc3c7',
  },
}))

export const DiscountInputWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const DiscountInput = styled.input({
  flex: 1,
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  outline: 'none',
  '&:focus': {
    borderColor: '#3498db',
  },
})

export const DiscountInputSuffix = styled.span({
  fontSize: '14px',
  fontWeight: 600,
  color: '#7f8c8d',
  minWidth: '20px',
})

export const ApplyDiscountButton = styled.button({
  padding: '10px 16px',
  backgroundColor: '#27ae60',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#229954',
  },
})

export const DiscountPreview = styled.div({
  padding: '8px 12px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
})

export const DiscountPreviewText = styled.p({
  fontSize: '12px',
  color: '#7f8c8d',
  margin: 0,
  '& strong': {
    color: '#2c3e50',
    fontWeight: 600,
  },
})

export const OrderSummary = styled.div({
  padding: '16px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #dbe4ef',
})

export const SummaryRow = styled.div<{ $total?: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: props.$total ? '12px 0' : '8px 0',
  borderBottom: props.$total ? 'none' : '1px dashed #d8e0ea',
}))

export const SummaryLabel = styled.span<{ $total?: boolean }>((props) => ({
  fontSize: props.$total ? '16px' : '13px',
  fontWeight: props.$total ? 600 : 400,
  color: props.$total ? '#2c3e50' : '#7f8c8d',
}))

export const SummaryValue = styled.span<{ $total?: boolean; $discount?: boolean }>((props) => ({
  fontSize: props.$total ? '20px' : '14px',
  fontWeight: props.$total ? 700 : 500,
  color: props.$discount ? '#e74c3c' : props.$total ? '#27ae60' : '#2c3e50',
}))

// ===== CustomerSelector Styles =====
export const CustomerSelectorContainer = styled.div({
  marginBottom: '16px',
})

export const SelectedCustomerCard = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: '#3498db',
  borderRadius: '8px',
  color: '#ffffff',
})

export const SelectedCustomerInfo = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const SelectedCustomerName = styled.span({
  fontSize: '16px',
  fontWeight: 600,
})

export const SelectedCustomerPhone = styled.span({
  fontSize: '14px',
  opacity: 0.9,
})

export const SelectedCustomerGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
})

export const DiscountBadge = styled.span({
  padding: '2px 8px',
  backgroundColor: '#27ae60',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 600,
})

export const RemoveCustomerButton = styled.button({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: 'none',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '24px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
  },
})

export const CustomerSearchButton = styled.button({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 16px',
  backgroundColor: '#ecf0f1',
  border: '2px dashed #bdc3c7',
  borderRadius: '8px',
  color: '#2c3e50',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: '#d5dbdb',
    borderColor: '#3498db',
  },
})

export const SearchButtonText = styled.span({
  fontSize: '14px',
  fontWeight: 500,
})

export const CustomerSearchModal = styled.div({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '400px',
  maxHeight: '70vh',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
})

export const Overlay = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 999,
})

export const SearchHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0',
})

export const SearchInput = styled.input({
  flex: 1,
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  outline: 'none',
  '&:focus': {
    borderColor: '#3498db',
  },
})

export const CloseSearchButton = styled.button({
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#e74c3c',
  border: 'none',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '20px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#c0392b',
  },
})

export const CustomerList = styled.div({
  flex: 1,
  overflowY: 'auto',
  padding: '8px',
})

export const EmptySearchResult = styled.div({
  padding: '16px',
  textAlign: 'center',
  color: '#7f8c8d',
  fontSize: '14px',
})

export const CustomerListItem = styled.button({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px',
  backgroundColor: '#ffffff',
  border: 'none',
  borderBottom: '1px solid #ecf0f1',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
  '&:last-child': {
    borderBottom: 'none',
  },
})

export const CustomerListItemMain = styled.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  alignItems: 'flex-start',
})

export const CustomerListItemName = styled.span({
  fontSize: '14px',
  fontWeight: 500,
  color: '#2c3e50',
})

export const CustomerListItemPhone = styled.span({
  fontSize: '12px',
  color: '#7f8c8d',
})

export const CustomerListGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  color: '#3498db',
})

export const SmallDiscountBadge = styled.span({
  padding: '2px 6px',
  backgroundColor: '#27ae60',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 600,
})
