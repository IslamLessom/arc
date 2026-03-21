-- Создаем таблицу для хранения информации о выплатах зарплаты
CREATE TABLE IF NOT EXISTS salary_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_salary DECIMAL(10, 2) NOT NULL,
    advances_deducted DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10, 2) NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    payment_date TIMESTAMP NOT NULL,
    paid_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    -- Индексы для быстрого поиска
    CONSTRAINT idx_salary_payments_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id),
    CONSTRAINT idx_salary_payments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT idx_salary_payments_period UNIQUE (establishment_id, user_id, period_start, period_end, deleted_at)
);

CREATE INDEX idx_salary_payments_establishment_id ON salary_payments(establishment_id);
CREATE INDEX idx_salary_payments_user_id ON salary_payments(user_id);
CREATE INDEX idx_salary_payments_period_start ON salary_payments(period_start);
CREATE INDEX idx_salary_payments_period_end ON salary_payments(period_end);
CREATE INDEX idx_salary_payments_payment_date ON salary_payments(payment_date);
CREATE INDEX idx_salary_payments_deleted_at ON salary_payments(deleted_at);

COMMENT ON TABLE salary_payments IS 'Хранит информацию о выплатах зарплаты сотрудникам';
COMMENT ON COLUMN salary_payments.total_salary IS 'Общая начисленная зарплата за период';
COMMENT ON COLUMN salary_payments.advances_deducted IS 'Сумма удержанных авансов';
COMMENT ON COLUMN salary_payments.amount_paid IS 'Фактически выплаченная сумма (total_salary - advances_deducted)';
COMMENT ON COLUMN salary_payments.transaction_id IS 'Ссылка на созданную расходную транзакцию';
COMMENT ON COLUMN salary_payments.paid_by IS 'Кто выполнил выплату';
