-- Add QR token to tables
ALTER TABLE tables ADD COLUMN IF NOT EXISTS qr_token UUID UNIQUE DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_tables_qr_token ON tables(qr_token);

-- Guest sessions (anonymous and registered guests via QR menu)
CREATE TABLE IF NOT EXISTS guest_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    table_id        UUID REFERENCES tables(id) ON DELETE SET NULL,
    guest_name      VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    password_hash   VARCHAR(255),
    is_anonymous    BOOLEAN NOT NULL DEFAULT true,
    token           UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_token            ON guest_sessions(token);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_establishment_id ON guest_sessions(establishment_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_phone            ON guest_sessions(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guest_sessions_table_id         ON guest_sessions(table_id);

-- Track order origin and guest info on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source           VARCHAR(50) NOT NULL DEFAULT 'pos';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name       VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_source           ON orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_guest_session_id ON orders(guest_session_id);
