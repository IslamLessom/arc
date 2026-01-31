-- Миграция: объединение initial_balance и current_balance в одно поле balance
-- Шаг 1: добавляем новую колонку balance
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS balance DOUBLE PRECISION DEFAULT 0;

-- Шаг 2: копируем данные из current_balance в balance
UPDATE accounts SET balance = current_balance WHERE balance = 0;

-- Шаг 3: удаляем старые колонки
ALTER TABLE accounts DROP COLUMN IF EXISTS initial_balance;
ALTER TABLE accounts DROP COLUMN IF EXISTS current_balance;
