-- Add warehouse_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;

-- Add index for warehouse_id
CREATE INDEX IF NOT EXISTS idx_products_warehouse_id ON products(warehouse_id);
