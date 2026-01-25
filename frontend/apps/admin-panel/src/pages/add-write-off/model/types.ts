export interface WriteOffItemFormData {
  id: string
  ingredient_id?: string
  product_id?: string
  ingredient_name?: string
  product_name?: string
  quantity: number
  unit: string
  details: string
}

export interface AddWriteOffFormData {
  write_off_date: string
  write_off_time_hours: string
  write_off_time_minutes: string
  warehouse_id: string
  reason: string
  comment: string
  items: WriteOffItemFormData[]
}

export interface FieldErrors {
  [key: string]: string | undefined
}

