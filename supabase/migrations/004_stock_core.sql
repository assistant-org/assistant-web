-- Stock Core: Products + Stock Batches + Stock Movements.
-- Balance is never stored on batches — available quantity and status are
-- derived from movement history (same principle as account balances).

CREATE TYPE PRODUCT_CATEGORY_ENUM AS ENUM ('BEVERAGE', 'SUPPLY', 'EQUIPMENT');
CREATE TYPE UNIT_OF_MEASURE_ENUM AS ENUM ('LITER', 'UNIT', 'KG');
CREATE TYPE STOCK_MOVEMENT_TYPE_ENUM AS ENUM (
  'ENTRY',
  'EXIT',
  'LOSS',
  'INTERNAL_CONSUMPTION',
  'ADJUSTMENT'
);
CREATE TYPE STOCK_MOVEMENT_DIRECTION_ENUM AS ENUM ('IN', 'OUT');
CREATE TYPE STOCK_MOVEMENT_ORIGIN_ENUM AS ENUM (
  'manual',
  'evento',
  'transacao',
  'ajuste'
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category PRODUCT_CATEGORY_ENUM NOT NULL,
  unit UNIT_OF_MEASURE_ENUM NOT NULL,
  track_stock BOOLEAN NOT NULL DEFAULT TRUE,
  min_stock NUMERIC NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE products IS 'Cadastro genérico de produtos. Não representa saldo de estoque.';

CREATE TABLE stock_batches (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  expiry_date DATE NULL,
  initial_quantity NUMERIC NOT NULL CHECK (initial_quantity > 0),
  unit_value NUMERIC NOT NULL DEFAULT 0 CHECK (unit_value >= 0),
  observations TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE stock_batches IS 'Lotes de estoque. Quantidade disponível e status são derivados das movimentações.';

CREATE TABLE stock_movements (
  id BIGSERIAL PRIMARY KEY,
  batch_id BIGINT NOT NULL REFERENCES stock_batches(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type STOCK_MOVEMENT_TYPE_ENUM NOT NULL,
  direction STOCK_MOVEMENT_DIRECTION_ENUM NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  date DATE NOT NULL,
  user_id UUID NULL REFERENCES auth.users(id),
  reason TEXT NULL,
  origin STOCK_MOVEMENT_ORIGIN_ENUM NOT NULL DEFAULT 'manual',
  origin_id BIGINT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT stock_movements_type_direction_check CHECK (
    (type = 'ENTRY' AND direction = 'IN')
    OR (type IN ('EXIT', 'LOSS', 'INTERNAL_CONSUMPTION') AND direction = 'OUT')
    OR (type = 'ADJUSTMENT' AND direction IN ('IN', 'OUT'))
  )
);

COMMENT ON TABLE stock_movements IS 'Única fonte de verdade do estoque. Toda alteração de saldo passa por aqui.';
COMMENT ON COLUMN stock_movements.origin_id IS 'Referência futura a Transaction (ou outro origem) quando a integração financeira for ligada.';

CREATE INDEX idx_stock_batches_product_id ON stock_batches(product_id);
CREATE INDEX idx_stock_movements_batch_id ON stock_movements(batch_id);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(date);
