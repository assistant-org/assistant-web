-- Local do evento (usado no contrato e no formulário de orçamento)

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS event_location TEXT;

COMMENT ON COLUMN budgets.event_location IS
  'Venue/location where the client event will take place.';
