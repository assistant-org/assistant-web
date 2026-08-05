-- Cut over transactions/accounts to the full Transactions model and retire
-- the legacy entries/output tables. Both are empty (0 rows), so this is a
-- clean schema cutover, not a data migration.
--
-- IMPORTANT: run 002_transaction_type_enum.sql first and in a separate
-- transaction — Postgres does not allow using a freshly added enum value
-- in the same transaction that added it.

ALTER TABLE transactions RENAME COLUMN origin_account TO source_account;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS origin_id BIGINT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE transactions
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN value SET NOT NULL,
  ALTER COLUMN date SET NOT NULL;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_value_positive CHECK (value > 0);

ALTER TABLE transactions
  ADD CONSTRAINT transactions_type_shape_check CHECK (
    (type IN ('INCOME', 'EXPENSE') AND category IS NOT NULL)
    OR (type = 'TRANSFER' AND source_account IS NOT NULL AND destination_account IS NOT NULL AND source_account <> destination_account)
  );

COMMENT ON TABLE transactions IS 'Fonte unica da verdade financeira: receitas, despesas e transferencias internas';

ALTER TABLE accounts RENAME COLUMN value TO opening_balance;

COMMENT ON TABLE accounts IS 'Contas financeiras internas (agrupamentos logicos de recursos)';

INSERT INTO accounts (name, active, opening_balance)
VALUES ('Conta Principal', true, 0);

DROP TABLE entries;
DROP TABLE output;
