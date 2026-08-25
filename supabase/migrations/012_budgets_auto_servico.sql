-- Allow AUTO_SERVICO in budgets.service_type (was TOTEM | KOMBI only)

ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_service_type_check;

ALTER TABLE budgets
  ADD CONSTRAINT budgets_service_type_check
  CHECK (service_type IN ('TOTEM', 'KOMBI', 'AUTO_SERVICO'));
