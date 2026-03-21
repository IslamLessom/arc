-- Remove background_image_url column from rooms table
ALTER TABLE rooms DROP COLUMN IF EXISTS background_image_url;
