import styled from 'styled-components'
import { colors } from '@restaurant-pos/ui/theme'

export const PageContainer = styled.div`
  padding: 24px;
  max-width: 100%;
  margin: 0 auto;
  background: ${colors.background};
  min-height: 100vh;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    flex-direction: column;
    align-items: stretch;
  }
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
  }
`

export const BackButton = styled.button`
  background: ${colors.backgroundHover};
  border: 1px solid ${colors.border};
  color: ${colors.textPrimary};
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  flex-shrink: 0;

  &:hover {
    background: ${colors.backgroundActive};
    border-color: ${colors.borderHover};
    transform: translateX(-1px);
  }

  &:active {
    transform: translateX(0) scale(0.98);
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
`

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: ${colors.backgroundHover};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  color: ${colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${colors.backgroundActive};
    border-color: ${colors.borderHover};
    color: ${colors.textPrimary};
  }

  &:active {
    transform: scale(0.98);
  }

  span:first-child {
    font-size: 16px;
  }

  .action-text {
    transition: opacity 0.2s ease;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    font-size: 13px;

    span:first-child {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 11px;

    .action-text {
      display: none;
    }

    span:first-child {
      font-size: 18px;
    }
  }
`

export const AddButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%);
  border: none;
  border-radius: 10px;
  color: ${colors.white};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 8px 16px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
  }
`

export const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: stretch;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    flex-direction: column;
    gap: 8px;
  }
`

export const SearchInputWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }

  .ant-input {
    background: ${colors.backgroundActive};
    border-color: ${colors.border};
    color: ${colors.textPrimary};

    &::placeholder {
      color: ${colors.textMuted};
    }

    &:hover {
      background: ${colors.backgroundActive};
      border-color: ${colors.border};
    }

    &:focus {
      background: ${colors.backgroundActive};
      border-color: ${colors.accent};
      box-shadow: 0 0 0 2px ${colors.accentBackground};
    }
  }
`

export const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  font-size: 18px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.6;
`

export const FilterButton = styled.button`
  padding: 10px 16px;
  background: ${colors.backgroundHover};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  color: ${colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${colors.backgroundActive};
    border-color: ${colors.borderHover};
    color: ${colors.textPrimary};
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
  }
`

export const TableContainer = styled.div`
  background: ${colors.backgroundHover};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px ${colors.shadow};
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${colors.background};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.borderHover};
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
      background: ${colors.textMuted};
    }
  }

  /* Ant Design Table customization */
  .ant-table {
    background: transparent;
    color: ${colors.textPrimary};
    font-size: 14px;

    @media (max-width: 768px) {
      font-size: 13px;
    }
  }

  .ant-table-row {
    cursor: pointer;

    &:hover {
      background: transparent !important;
    }
  }

  .ant-table-thead > tr > th {
    background: ${colors.backgroundActive};
    border-bottom: 1px solid ${colors.border};
    color: ${colors.textSecondary};
    font-weight: 600;
    padding: 16px;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;

    &:hover {
      background: ${colors.backgroundActive} !important;
    }

    @media (max-width: 768px) {
      padding: 12px 8px;
      font-size: 11px;
    }

    @media (max-width: 480px) {
      padding: 10px 6px;
      font-size: 10px;
    }
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${colors.border};
    padding: 16px;
    color: ${colors.textPrimary};
    background: transparent !important;

    @media (max-width: 768px) {
      padding: 12px 8px;
    }

    @media (max-width: 480px) {
      padding: 10px 6px;
    }
  }

  .ant-table-tbody > tr {
    &:hover {
      background: transparent !important;
    }
  }

  .ant-table-wrapper {
    overflow-x: auto;

    @media (max-width: 768px) {
      /* Enable horizontal scroll on mobile */
      -webkit-overflow-scrolling: touch;
    }
  }

  .ant-table-container {
    min-width: 100%;

    @media (max-width: 768px) {
      min-width: 600px;
    }
  }

  /* Summary row styling */
  .ant-table-summary {
    background: ${colors.backgroundActive};
    border-top: 2px solid ${colors.border};

    > div > tr > td {
      background: ${colors.backgroundActive};
      color: ${colors.textPrimary};
      font-weight: 700;
      border-bottom: none;
    }
  }

  /* Empty state */
  .ant-empty {
    color: ${colors.textSecondary};
  }

  .ant-empty-description {
    color: ${colors.textMuted};
  }
`

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;

  &::before {
    content: '';
    width: 48px;
    height: 48px;
    border: 3px solid ${colors.border};
    border-top-color: ${colors.accent};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  > span {
    color: ${colors.textSecondary};
    font-size: 18px;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    min-height: 300px;

    &::before {
      width: 40px;
      height: 40px;
    }

    > span {
      font-size: 16px;
    }
  }
`

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${colors.danger};
  font-size: 16px;
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);

  @media (max-width: 768px) {
    min-height: 300px;
    font-size: 14px;
    padding: 16px;
  }
`

export const MobileActionsDropdown = styled.div<{ isOpen: boolean }>`
  display: none;

  @media (max-width: 480px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${colors.backgroundHover};
    border-top: 1px solid ${colors.border};
    padding: 12px;
    box-shadow: 0 -4px 16px ${colors.shadow};
    z-index: 1000;
    animation: slideUp 0.3s ease;

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
  }
`

export const MobileActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  @media (max-width: 360px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export const MobileActionItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: ${colors.backgroundActive};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  color: ${colors.textSecondary};
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.backgroundHover};
    border-color: ${colors.borderHover};
    color: ${colors.textPrimary};
  }

  span {
    font-size: 20px;
  }
`

export const MobileMenuButton = styled.button<{ isVisible: boolean }>`
  display: none;

  @media (max-width: 480px) {
    display: ${props => props.isVisible ? 'flex' : 'none'};
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.accent}, ${colors.accentHover});
    border: none;
    box-shadow: 0 4px 16px ${colors.shadow};
    color: ${colors.white};
    font-size: 24px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 999;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px ${colors.shadow};
    }

    &:active {
      transform: scale(1.05);
    }
  }
`

export const MobileCardsContainer = styled.div`
  display: none;
  animation: fadeIn 0.3s ease;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`

export const IngredientCard = styled.div`
  background: ${colors.backgroundHover};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
`

export const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
  word-break: break-word;
  flex: 1;
  line-height: 1.4;
`

export const CardActions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`

export const CardAction = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${colors.backgroundActive};
  border: 1px solid ${colors.border};
  color: ${colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  &:hover {
    background: ${colors.accentBackground};
    border-color: ${colors.accentLight};
    color: ${colors.accentLight};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(1.02);
  }
`

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`

export const CardLabel = styled.span`
  font-size: 13px;
  color: ${colors.textSecondary};
  flex-shrink: 0;
`

export const CardValue = styled.span<{ $accent?: boolean }>`
  font-size: 14px;
  color: ${props => props.$accent ? colors.accent : colors.textPrimary};
  font-weight: 500;
  text-align: right;
  word-break: break-word;
`

export const CardCategory = styled.div`
  display: inline-block;
  padding: 4px 10px;
  background: ${colors.accentBackground};
  color: ${colors.accentLight};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`

export const CardStock = styled.div<{ $low?: boolean }>`
  padding: 6px 12px;
  background: ${props => props.$low ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'};
  color: ${props => props.$low ? '#ef4444' : '#22c55e'};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
`

export const CardCost = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.accentLight};
`

export const SummaryCard = styled.div`
  display: none;
  background: linear-gradient(135deg, ${colors.backgroundActive} 0%, ${colors.backgroundHover} 100%);
  border: 1px solid ${colors.borderHover};
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
  box-shadow: 0 4px 16px ${colors.shadow};

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`

export const SummaryTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`

export const SummaryItem = styled.div`
  background: ${colors.background};
  border-radius: 12px;
  padding: 12px;
  border: 1px solid ${colors.border};
`

export const SummaryItemLabel = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-bottom: 4px;
`

export const SummaryItemValue = styled.div<{ $accent?: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.$accent ? colors.accentLight : colors.textPrimary};
`

export const EmptyState = styled.div`
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  animation: fadeIn 0.3s ease;

  @media (max-width: 768px) {
    display: flex;
  }

  @media (min-width: 769px) {
    display: none !important;
  }
`

export const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`

export const EmptyStateText = styled.div`
  font-size: 16px;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
`

export const EmptyStateSubtext = styled.div`
  font-size: 14px;
  color: ${colors.textMuted};
`
