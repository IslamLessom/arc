-- Создание таблицы тарифных планов
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    duration INTEGER NOT NULL, -- длительность в днях
    price DECIMAL(10, 2) DEFAULT 0,
    features TEXT, -- JSON строка со списком функций
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Создание индексов для subscription_plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_deleted_at ON subscription_plans(deleted_at);

-- Создание таблицы подписок
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Создание индексов для subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_deleted_at ON subscriptions(deleted_at);

-- Добавление поля subscription_id в таблицу users (если еще не существует)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='subscription_id') THEN
        ALTER TABLE users ADD COLUMN subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;
        CREATE INDEX idx_users_subscription_id ON users(subscription_id);
    END IF;
END $$;

-- Добавление поля is_super_admin в таблицу roles (для супер-админов)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='roles' AND column_name='is_super_admin') THEN
        ALTER TABLE roles ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
        CREATE INDEX idx_roles_is_super_admin ON roles(is_super_admin);
    END IF;
END $$;

-- Вставка базового тарифного плана "Trial" (14 дней бесплатно)
INSERT INTO subscription_plans (name, duration, price, features, active)
VALUES ('Trial', 14, 0, '{"all_features": true}', true)
ON CONFLICT (name) DO NOTHING;

-- Вставка базового тарифного плана "Basic" (30 дней)
INSERT INTO subscription_plans (name, duration, price, features, active)
VALUES ('Basic', 30, 999, '{"all_features": true, "support": "email"}', true)
ON CONFLICT (name) DO NOTHING;

-- Создание роли супер-админа
INSERT INTO roles (name, is_super_admin, permissions)
VALUES ('super_admin', true, '{}')
ON CONFLICT (name) 
DO UPDATE SET is_super_admin = true;

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
