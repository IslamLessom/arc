-- Add client_id to order_items table for per-guest client tracking
ALTER TABLE order_items 
ADD COLUMN client_id UUID REFERENCES clients(id);

-- Create index for better query performance
CREATE INDEX idx_order_items_client_id ON order_items(client_id);

-- Update existing order_items to inherit client_id from their orders
UPDATE order_items 
SET client_id = orders.client_id
FROM orders 
WHERE order_items.order_id = orders.id 
  AND orders.client_id IS NOT NULL;
