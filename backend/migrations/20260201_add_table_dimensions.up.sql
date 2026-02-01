-- Миграция: добавление полей width, height, shape в таблицу tables
ALTER TABLE tables ADD COLUMN IF NOT EXISTS width DOUBLE PRECISION DEFAULT 80;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS height DOUBLE PRECISION DEFAULT 80;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS shape VARCHAR(10) DEFAULT 'round';

-- Обновляем существующие записи, если они имеют нулевые значения
UPDATE tables SET width = 80 WHERE width IS NULL OR width = 0;
UPDATE tables SET height = 80 WHERE height IS NULL OR height = 0;
UPDATE tables SET shape = 'round' WHERE shape IS NULL OR shape = '';

