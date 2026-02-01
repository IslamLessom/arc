-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    floor INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_rooms_establishment ON rooms(establishment_id);

-- Add room_id to tables
ALTER TABLE tables ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tables_room ON tables(room_id);

-- Drop old unique index and create new ones
DROP INDEX IF EXISTS idx_table_number_establishment;
CREATE UNIQUE INDEX idx_table_number_room ON tables(number, room_id) WHERE room_id IS NOT NULL;
CREATE UNIQUE INDEX idx_table_number_establishment_no_room ON tables(number, establishment_id) WHERE room_id IS NULL;
