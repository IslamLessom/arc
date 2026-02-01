-- Make room_id NOT NULL and remove establishment_id from tables

-- Check if we need to migrate data (establishment_id still exists)
DO $$
DECLARE
    table_record RECORD;
    room_id UUID;
    has_establishment_id BOOLEAN;
BEGIN
    -- Check if establishment_id column still exists
    has_establishment_id := EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tables' AND column_name = 'establishment_id'
    );

    IF has_establishment_id THEN
        -- For each table without a room_id but with establishment_id, assign to a room
        FOR table_record IN
            SELECT id, establishment_id FROM tables WHERE room_id IS NULL AND establishment_id IS NOT NULL
        LOOP
            -- Get the first room for this establishment
            SELECT id INTO room_id FROM rooms WHERE establishment_id = table_record.establishment_id LIMIT 1;

            -- If no room exists, create a default room
            IF room_id IS NULL THEN
                INSERT INTO rooms (establishment_id, name, floor, active)
                VALUES (table_record.establishment_id, 'Основной зал', 1, true)
                RETURNING id INTO room_id;
            END IF;

            -- Update the table with the room_id
            UPDATE tables SET room_id = room_id WHERE id = table_record.id;
        END LOOP;
    END IF;

    -- Delete ALL tables that still have room_id IS NULL (orphaned records)
    DELETE FROM tables WHERE room_id IS NULL;
END $$;

-- Make room_id NOT NULL
ALTER TABLE tables ALTER COLUMN room_id SET NOT NULL;

-- Drop establishment_id from tables (if it still exists)
ALTER TABLE tables DROP COLUMN IF EXISTS establishment_id;

-- Drop old indexes
DROP INDEX IF EXISTS idx_table_number_establishment_no_room;
DROP INDEX IF EXISTS idx_tables_establishment;
