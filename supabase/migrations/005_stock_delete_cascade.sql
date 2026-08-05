-- Allow hard-deleting products (and batches) by cascading dependent stock rows.
-- Fixes: cannot delete product/batch while stock_movements still reference them.

ALTER TABLE stock_movements
  DROP CONSTRAINT IF EXISTS stock_movements_batch_id_fkey;

ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES stock_batches(id) ON DELETE CASCADE;

ALTER TABLE stock_movements
  DROP CONSTRAINT IF EXISTS stock_movements_product_id_fkey;

ALTER TABLE stock_movements
  ADD CONSTRAINT stock_movements_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE stock_batches
  DROP CONSTRAINT IF EXISTS stock_batches_product_id_fkey;

ALTER TABLE stock_batches
  ADD CONSTRAINT stock_batches_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
