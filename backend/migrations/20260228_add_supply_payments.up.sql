-- Создание таблицы supply_payments для поддержки нескольких платежей по поставкам
CREATE TABLE IF NOT EXISTS supply_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    payment_date_time TIMESTAMP NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_supply_payments_supply_id ON supply_payments(supply_id);
CREATE INDEX idx_supply_payments_account_id ON supply_payments(account_id);
CREATE INDEX idx_supply_payments_payment_date_time ON supply_payments(payment_date_time);
CREATE INDEX idx_supply_payments_transaction_id ON supply_payments(transaction_id);

-- Комментарии к таблице и полям
COMMENT ON TABLE supply_payments IS 'Платежи по поставкам (поддержка оплаты с нескольких счетов)';
COMMENT ON COLUMN supply_payments.id IS 'Уникальный идентификатор платежа';
COMMENT ON COLUMN supply_payments.supply_id IS 'ID поставки';
COMMENT ON COLUMN supply_payments.account_id IS 'ID счета, с которого производится оплата';
COMMENT ON COLUMN supply_payments.amount IS 'Сумма платежа';
COMMENT ON COLUMN supply_payments.payment_date_time IS 'Дата и время платежа';
COMMENT ON COLUMN supply_payments.transaction_id IS 'ID созданной транзакции';
COMMENT ON COLUMN supply_payments.created_at IS 'Дата создания записи';
COMMENT ON COLUMN supply_payments.updated_at IS 'Дата последнего обновления записи';
