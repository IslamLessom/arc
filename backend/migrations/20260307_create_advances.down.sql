-- Удаление индексов для advances
DROP INDEX IF EXISTS idx_advances_user_id;
DROP INDEX IF EXISTS idx_advances_establishment_id;
DROP INDEX IF EXISTS idx_advances_given_date;
DROP INDEX IF EXISTS idx_advances_status;
DROP INDEX IF EXISTS idx_advances_applied_period_start;
DROP INDEX IF EXISTS idx_advances_applied_period_end;
DROP INDEX IF EXISTS idx_advances_deleted_at;
DROP INDEX IF EXISTS idx_advances_user_establishment;

-- Удаление таблицы advances
DROP TABLE IF EXISTS advances;
