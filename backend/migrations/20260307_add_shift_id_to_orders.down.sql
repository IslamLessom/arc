-- Remove shift_id column from orders table
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS fk_orders_shift_id;
DROP INDEX IF EXISTS idx_orders_shift_id;
ALTER TABLE "orders" DROP COLUMN IF EXISTS shift_id;
