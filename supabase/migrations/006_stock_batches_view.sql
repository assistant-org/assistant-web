-- Derived available quantity + status for server-side filter/pagination.
CREATE OR REPLACE VIEW v_stock_batches AS
SELECT
  b.id,
  b.product_id,
  b.entry_date,
  b.expiry_date,
  b.initial_quantity,
  b.unit_value,
  b.observations,
  b.created_at,
  b.updated_at,
  COALESCE(
    SUM(
      CASE
        WHEN m.direction = 'IN' THEN m.quantity
        ELSE -m.quantity
      END
    ),
    0
  ) AS available_quantity,
  CASE
    WHEN COALESCE(
      SUM(
        CASE
          WHEN m.direction = 'IN' THEN m.quantity
          ELSE -m.quantity
        END
      ),
      0
    ) > 0 THEN 'ACTIVE'
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
  b.created_at,
  b.updated_at;

COMMENT ON VIEW v_stock_batches IS 'Stock batches with derived available_quantity and status for filtered/paginated queries.';
