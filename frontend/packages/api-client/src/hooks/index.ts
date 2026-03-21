// Hooks
export {
  useActiveOrders,
  useActiveOrdersFormatted,
  useOrders,
  useOrder,
  useCreateOrder,
  transformApiOrderToOrder,
} from './useOrders'
export type { ApiOrder, ApiOrderItem, GetOrdersFilter } from './useOrders'
export { useAuth } from './useAuth'
export type { AuthResponse, AuthUser, LoginRequest } from './useAuth'
export { useRegister } from './useRegister'
export { usePinLogin } from './usePinLogin'
export type { PinLoginRequest, PinLoginResponse, PinAuthUser } from './usePinLogin'
export { useOnboarding, useOnboardingQuestions } from './useOnboarding'
export { useCurrentUser } from './useCurrentUser'
export type { CurrentUserResponse } from './useCurrentUser'
export { useSubscription } from './useSubscription'
export type { UserSubscriptionResponse } from './useSubscription'
export { useGetStock, useUpdateStockLimit } from './useStock'
export type { Stock } from './useStock'
export {
  useGetCategories,
  useGetCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './useCategories'
export {
  useGetIngredientCategories,
  useGetIngredientCategory,
  useCreateIngredientCategory,
  useUpdateIngredientCategory,
  useDeleteIngredientCategory,
} from './useIngredientCategories'
export {
  useGetSemiFinishedProducts,
  useGetSemiFinishedProduct,
  useCreateSemiFinishedProduct,
  useUpdateSemiFinishedProduct,
  useDeleteSemiFinishedProduct,
} from './useSemiFinished'
export type { SemiFinishedProduct } from './useSemiFinished'
export {
  useGetIngredients,
  useGetIngredient,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from './useIngredients'
export {
  useGetWarehouses,
  useGetWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
} from './useWarehouses'
export {
  useGetTechnicalCards,
  useGetTechnicalCard,
  useCreateTechnicalCard,
  useUpdateTechnicalCard,
  useDeleteTechnicalCard,
} from './useTechnicalCards'
export type { CreateTechnicalCardRequest, UpdateTechnicalCardRequest, TechnicalCard } from './useTechnicalCards'
export {
  useGetSupplies,
  useGetSupply,
  useCreateSupply,
  useUpdateSupply,
} from './useSupplies'
export type { Supply, SupplyItem, CreateSupplyRequest, SupplyPaymentRequest } from './useSupplies'
export {
  useGetWriteOffs,
  useGetWriteOff,
  useCreateWriteOff,
} from './useWriteOffs'
export type { CreateWriteOffRequest } from './useWriteOffs'
export {
  useGetWriteOffReasons,
  useGetWriteOffReason,
  useCreateWriteOffReason,
  useUpdateWriteOffReason,
  useDeleteWriteOffReason,
} from './useWriteOffReasons'
export type { WriteOffReason, CreateWriteOffReasonRequest, UpdateWriteOffReasonRequest } from './useWriteOffReasons'
export { useGetMovements, useCreateMovement } from './useMovements'
export type { Movement, MovementFilter, MovementItem, CreateMovementRequest } from './useMovements'
export {
  useGetSuppliers,
  useGetSupplier,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from './useSuppliers'
export type { Supplier } from './useSuppliers'
export {
  useGetProducts,
  useGetProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './useProducts'
export type { Product, ProductFilter, CreateProductRequest, UpdateProductRequest } from './useProducts'
export {
  useGetWorkshops,
  useGetWorkshop,
  useCreateWorkshop,
  useUpdateWorkshop,
  useDeleteWorkshop,
} from './useWorkshops'
export type { Workshop, CreateWorkshopRequest, UpdateWorkshopRequest } from './useWorkshops'
export {
  useGetEmployees,
  useGetEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from './useEmployees'
export type { Employee } from './useEmployees'
export { useGetRoles } from './useRoles'
export type { Role } from './useRoles'
export {
  useGetInventories,
  useGetInventory,
  useCreateInventory,
  useUpdateInventory,
  useUpdateInventoryStatus,
  useDeleteInventory,
} from './useInventories'
export type {
  Inventory,
  InventoryItem,
  InventoryFilter,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  UpdateInventoryStatusRequest,
} from './useInventories'
export {
  useGetPositions,
  useGetPosition,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from './usePositions'
export type { Position, PositionDetails, PositionPermissions, CreatePositionRequest, UpdatePositionRequest } from './usePositions'
export {
  useGetAccounts,
  useGetAccount,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useGetAccountTypes,
} from './useAccounts'
export type { CreateAccountRequest, UpdateAccountRequest } from './useAccounts'
export {
  useGetTransactions,
  useGetTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from './useTransactions'
export type { TransactionFilter, CreateTransactionRequest, UpdateTransactionRequest } from './useTransactions'
export {
  useGetActiveShift,
  useEndShift,
  useStartShift,
  useGetShifts,
  useDeleteShift,
  transformApiShiftToShift,
} from './useShifts'
export type { ApiShift, ShiftSession, EndShiftRequest, StartShiftRequest, StartShiftResponse, ActiveShiftResponse, ActiveShiftErrorResponse, GetShiftsFilter } from './useShifts'
export { useLogout } from './useLogout'
export type { LogoutResponse } from './useLogout'
export { useRefreshToken } from './useRefreshToken'
export type { RefreshTokenRequest, RefreshTokenResponse } from './useRefreshToken'
export {
  useGetTables,
  useGetTable,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useGenerateTableQRToken,
} from './useTables'
export type { Table, CreateTableRequest, UpdateTableRequest } from './useTables'
export {
  useGetRooms,
  useGetRoom,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from './useRooms'
export type { Room, CreateRoomRequest, UpdateRoomRequest } from './useRooms'
export {
  useGetEstablishments,
  useGetEstablishment,
  useCreateEstablishment,
  useUpdateEstablishment,
  useDeleteEstablishment,
  useCurrentEstablishment,
} from './useEstablishments'
export type {
  Establishment,
  CreateEstablishmentRequest,
  UpdateEstablishmentRequest,
} from './useEstablishments'
export { useSalaryReport, usePaySalary } from './useSalary'
export type { SalaryEntry, SalaryReport, PaySalaryRequest, SalaryPayment } from './useSalary'
export {
  useAdvances,
  usePendingAdvances,
  useAdvanceByID,
  useCreateAdvance,
  useDeleteAdvance,
} from './useAdvances'
export type { Advance } from './useAdvances'
export { useEmployeeStatistics, useAllEmployeeStatistics } from './useEmployeeStatistics'
export type { EmployeeStatistics } from './useEmployeeStatistics'
export { useProfitAndLossReport } from './useProfitAndLoss'
export type { ProfitAndLossParams } from './useProfitAndLoss'
export { useUploadImage } from './useUpload'
export { useCustomers } from './useCustomers'
export type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from './useCustomers'
export { useCustomerGroups } from './useCustomerGroups'
export type { CustomerGroup, CreateCustomerGroupRequest, UpdateCustomerGroupRequest } from './useCustomerGroups'
export {
  useMarketingLoyaltyPrograms,
} from './useMarketingLoyaltyPrograms'
export type {
  LoyaltyProgram as MarketingLoyaltyProgram,
  LoyaltyProgramType as MarketingLoyaltyProgramType,
  CreateLoyaltyProgramRequest,
  UpdateLoyaltyProgramRequest,
} from './useMarketingLoyaltyPrograms'
export {
  useMarketingPromotions,
} from './useMarketingPromotions'
export type {
  Promotion as MarketingPromotion,
  PromotionType as MarketingPromotionType,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from './useMarketingPromotions'
export {
  useMarketingExclusions,
} from './useMarketingExclusions'
export type {
  Exclusion as MarketingExclusion,
  ExclusionType as MarketingExclusionType,
  CreateExclusionRequest,
  UpdateExclusionRequest,
} from './useMarketingExclusions'
export {
  useSalesStatistics,
  useCustomerStatistics,
  useEmployeesStatistics,
  useWorkshopStatistics,
  useTableStatistics,
  useCategoryStatistics,
  useProductStatistics,
  useABCAnalysis,
  useCheckStatistics,
  useReviewStatistics,
  usePaymentStatistics,
  useTaxStatistics,
} from './useStatistics'
export type {
  SalesStatistics,
  CustomerStatistics,
  EmployeesSalesStatistics,
  WorkshopStatistics,
  TableStatistics,
  CategoryStatistics,
  ProductStatistics,
  ABCAnalysisData,
  CheckStatistics,
  ReviewStatistics,
  PaymentStatistics,
  TaxStatistics,
} from '../types'

export { useSubscriptionReadOnly } from './useSubscriptionReadOnly'

// QR Menu (public — no employee auth required)
export {
  useQRTableInfo,
  useQRMenu,
  useCreateGuestSession,
  useRegisterGuest,
  useLoginGuest,
  useCreateQROrder,
  useMyQROrders,
} from './useQRMenu'
export type {
  QRTableInfo,
  QRMenuCategory,
  QRProduct,
  GuestSession,
  GuestSessionResponse,
  QROrderItem,
  QROrder,
} from './useQRMenu'

// Types
export * from '../types'
