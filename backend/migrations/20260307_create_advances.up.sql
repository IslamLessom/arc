-- Создание таблицы для авансов
CREATE TABLE IF NOT EXISTS advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    given_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    -- Status может быть: pending, applied
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Период зарплаты, за который был применён аванс
    applied_to_salary_period_start TIMESTAMP WITH TIME ZONE,
    applied_to_salary_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Создание индексов для advances
CREATE INDEX IF NOT EXISTS idx_advances_user_id ON advances(user_id);
CREATE INDEX IF NOT EXISTS idx_advances_establishment_id ON advances(establishment_id);
CREATE INDEX IF NOT EXISTS idx_advances_given_date ON advances(given_date);
CREATE INDEX IF NOT EXISTS idx_advances_status ON advances(status);
CREATE INDEX IF NOT EXISTS idx_advances_applied_period_start ON advances(applied_to_salary_period_start);
CREATE INDEX IF NOT EXISTS idx_advances_applied_period_end ON advances(applied_to_salary_period_end);
CREATE INDEX IF NOT EXISTS idx_advances_deleted_at ON advances(deleted_at);
CREATE INDEX IF NOT EXISTS idx_advances_user_establishment ON advances(user_id, establishment_id);
