-- Budgets (commercial quotes) — audit trail of calculated vs negotiated totals

CREATE TABLE IF NOT EXISTS budgets (
  id BIGSERIAL PRIMARY KEY,
  service_type TEXT NOT NULL CHECK (service_type IN ('TOTEM', 'KOMBI')),
  people INTEGER NOT NULL CHECK (people > 0),
  hours INTEGER NOT NULL CHECK (hours > 0),
  consumption_profile TEXT NOT NULL CHECK (
    consumption_profile IN ('CASUAL', 'MODERATE', 'HIGH')
  ),
  other_drinks BOOLEAN NOT NULL DEFAULT FALSE,
  distance_km NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (distance_km >= 0),
  flavors JSONB NOT NULL DEFAULT '[]'::jsonb,
  extras JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculation JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_total NUMERIC(12, 2) NOT NULL,
  final_total NUMERIC(12, 2) NOT NULL,
  adjustment_reason TEXT,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_city TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON budgets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_client_name ON budgets (client_name);

COMMENT ON TABLE budgets IS 'Commercial chopp event quotes with full calculation snapshot for audit.';
COMMENT ON COLUMN budgets.calculation IS 'Full BudgetCalculationResult snapshot (internal breakdown).';
COMMENT ON COLUMN budgets.calculated_total IS 'System-calculated total before commercial negotiation.';
COMMENT ON COLUMN budgets.final_total IS 'Value used in client proposal (negotiated or calculated).';
