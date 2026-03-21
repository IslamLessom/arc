-- Remove client_id from order_items
DROP INDEX IF EXISTS idx_order_items_client_id;
ALTER TABLE order_items DROP COLUMN IF EXISTS client_id;
