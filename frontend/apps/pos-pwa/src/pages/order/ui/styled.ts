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
