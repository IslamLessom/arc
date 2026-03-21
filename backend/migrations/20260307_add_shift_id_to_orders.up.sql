-- Add shift_id column to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS shift_id UUID;

-- Add foreign key constraint
ALTER TABLE "orders" 
ADD CONSTRAINT fk_orders_shift_id 
FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_shift_id ON "orders"(shift_id);
