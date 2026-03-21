ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS target_type VARCHAR(32) NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS target_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE promotions
SET target_type = 'all'
WHERE target_type IS NULL OR target_type = '';

UPDATE promotions
SET target_ids = '[]'::jsonb
WHERE target_ids IS NULL;
