-- Add background_image_url column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS background_image_url TEXT;
