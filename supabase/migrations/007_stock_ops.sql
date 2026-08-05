-- Stock ops: product default price, event links, multi-item groups, reversal audit.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS default_unit_value NUMERIC NOT NULL DEFAULT 0
    CHECK (default_unit_value >= 0);

COMMENT ON COLUMN products.default_unit_value IS 'Preço padrão por litro (R$/L). Pré-preenche entradas; editável na movimentação.';

ALTER TABLE stock_batches
  ADD COLUMN IF NOT EXISTS event_id TEXT NULL;

COMMENT ON COLUMN stock_batches.event_id IS 'Evento associado na entrada do lote (exibição no select de saída).';

ALTER TABLE stock_movements
  ADD COLUMN IF NOT EXISTS event_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS operation_group_id UUID NULL,
  ADD COLUMN IF NOT EXISTS reverses_movement_id BIGINT NULL
    REFERENCES stock_movements(id) ON DELETE SET NULL;

COMMENT ON COLUMN stock_movements.event_id IS 'Evento da operação (obrigatório para ENTRY/EXIT na UI).';
COMMENT ON COLUMN stock_movements.operation_group_id IS 'Agrupa linhas de um lançamento multi-item.';
COMMENT ON COLUMN stock_movements.reverses_movement_id IS 'Movimento original quando esta linha é uma reversão.';

CREATE INDEX IF NOT EXISTS idx_stock_batches_event_id ON stock_batches(event_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_event_id ON stock_movements(event_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_operation_group_id ON stock_movements(operation_group_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reverses_movement_id ON stock_movements(reverses_movement_id);

-- Refresh view to expose event_id on batches.
DROP VIEW IF EXISTS v_stock_batches;

CREATE VIEW v_stock_batches AS
SELECT
  b.id,
  b.product_id,
  b.entry_date,
  b.expiry_date,
  b.initial_quantity,
  b.unit_value,
  b.observations,
  b.event_id,
  b.created_at,
  b.updated_at,
  COALESCE(SUM(
    CASE
      WHEN m.direction = 'IN' THEN m.quantity
      WHEN m.direction = 'OUT' THEN -m.quantity
      ELSE 0
    END
  ), 0) AS available_quantity,
  CASE
    WHEN COALESCE(SUM(
      CASE
        WHEN m.direction = 'IN' THEN m.quantity
        WHEN m.direction = 'OUT' THEN -m.quantity
        ELSE 0
      END
    ), 0) > 0 THEN 'ACTIVE'
    ELSE 'CLOSED'
  END AS status
FROM stock_batches b
LEFT JOIN stock_movements m ON m.batch_id = b.id
GROUP BY
  b.id,
  b.product_id,
  b.entry_date,
  b.expiry_date,
  b.initial_quantity,
  b.unit_value,
  b.observations,
  b.event_id,
  b.created_at,
  b.updated_at;
