ALTER TABLE promotions
  DROP COLUMN IF EXISTS target_ids,
  DROP COLUMN IF EXISTS target_type;
