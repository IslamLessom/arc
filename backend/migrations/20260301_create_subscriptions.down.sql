-- Откат миграции

-- Удаление триггеров
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;

-- Удаление поля subscription_id из users
ALTER TABLE users DROP COLUMN IF EXISTS subscription_id;

-- Удаление поля is_super_admin из roles
ALTER TABLE roles DROP COLUMN IF EXISTS is_super_admin;

-- Удаление таблицы subscriptions
DROP TABLE IF EXISTS subscriptions;

-- Удаление таблицы subscription_plans
DROP TABLE IF EXISTS subscription_plans;

-- Удаление роли супер-админа
DELETE FROM roles WHERE name = 'super_admin';
