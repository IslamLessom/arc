export interface SupplyItemFormData {
  id: string
  ingredient_id?: string
  product_id?: string
  ingredient_name?: string
  product_name?: string
  quantity: number
  unit: string
  price_per_unit: number
  total_amount: number
}

export interface PaymentFormData {
  id: string
  account_type: string
  payment_date: string
  payment_time_hours: string
  payment_time_minutes: string
  amount: number
}

export interface AddSupplyFormData {
  delivery_date: string
  delivery_time_hours: string
  delivery_time_minutes: string
  supplier_id: string
  warehouse_id: string
  comment: string
  items: SupplyItemFormData[]
  payments: PaymentFormData[]
}

export interface FieldErrors {
  [key: string]: string | undefined
}

