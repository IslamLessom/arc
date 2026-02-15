// Sales Statistics
export interface SalesStatistics {
  total_revenue: number
  total_orders: number
  average_order_value: number
  total_guests: number
  revenue_by_payment_method?: {
    cash: number
    card: number
    online: number
  }
  revenue_by_category?: Array<{
    category_id: string
    category_name: string
    revenue: number
    orders_count: number
    percentage: number
  }>
  daily_revenue?: Array<{
    date: string
    revenue: number
    orders_count: number
  }>
}

// Customer Statistics
export interface CustomerStatistics {
  total_customers: number
  new_customers: number
  returning_customers: number
  average_orders_per_customer: number
  average_revenue_per_customer: number
  top_customers?: Array<{
    customer_id: string
    customer_name: string
    total_orders: number
    total_revenue: number
    last_visit: string
  }>
}

// Employee Statistics (Sales context)
export interface EmployeesSalesStatistics {
  total_employees: number
  active_employees: number
  total_sales: number
  average_sales_per_employee: number
  top_employees?: Array<{
    employee_id: string
    employee_name: string
    total_orders: number
    total_revenue: number
  }>
}

// Workshop Statistics
export interface WorkshopStatistics {
  total_workshops: number
  active_workshops: number
  total_production: number
  average_production_per_workshop: number
  production_by_workshop?: Array<{
    workshop_id: string
    workshop_name: string
    total_production: number
    total_products: number
  }>
}

// Table Statistics
export interface TableStatistics {
  total_tables: number
  occupied_tables: number
  available_tables: number
  average_occupancy_rate: number
  total_revenue_by_table?: Array<{
    table_id: string
    table_number: number
    total_revenue: number
    total_orders: number
    average_order_value: number
  }>
}

// Category Statistics
export interface CategoryStatistics {
  total_categories: number
  total_revenue: number
  top_categories?: Array<{
    category_id: string
    category_name: string
    total_revenue: number
    orders_count: number
    percentage: number
  }>
}

// Product Statistics
export interface ProductStatistics {
  total_products: number
  total_quantity_sold: number
  total_revenue: number
  top_products?: Array<{
    product_id: string
    product_name: string
    quantity_sold: number
    revenue: number
    category_name: string
  }>
}

// ABC Analysis Data
export interface ABCAnalysisData {
  total_products: number
  group_a: Array<{
    product_id: string
    product_name: string
    revenue: number
    quantity_sold: number
    percentage: number
  }>
  group_b: Array<{
    product_id: string
    product_name: string
    revenue: number
    quantity_sold: number
    percentage: number
  }>
  group_c: Array<{
    product_id: string
    product_name: string
    revenue: number
    quantity_sold: number
    percentage: number
  }>
}

// Check Statistics
export interface CheckStatistics {
  total_checks: number
  total_revenue: number
  average_check_value: number
  checks_by_status?: Array<{
    status: string
    count: number
    revenue: number
  }>
  checks_by_payment_method?: Array<{
    payment_method: string
    count: number
    revenue: number
  }>
}

// Review Statistics
export interface ReviewStatistics {
  total_reviews: number
  average_rating: number
  reviews_by_rating?: Array<{
    rating: number
    count: number
    percentage: number
  }>
  recent_reviews?: Array<{
    review_id: string
    customer_name: string
    rating: number
    comment: string
    created_at: string
  }>
}

// Payment Statistics
export interface PaymentStatistics {
  total_payments: number
  total_amount: number
  payments_by_method?: Array<{
    payment_method: string
    count: number
    amount: number
    percentage: number
  }>
  payments_by_status?: Array<{
    status: string
    count: number
    amount: number
  }>
}

// Tax Statistics
export interface TaxStatistics {
  total_revenue: number
  total_tax: number
  tax_rate: number
  tax_by_category?: Array<{
    category_name: string
    revenue: number
    tax_amount: number
    tax_rate: number
  }>
}
