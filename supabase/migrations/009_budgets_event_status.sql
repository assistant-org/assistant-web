-- Budgets: event date, status, reminder prep for team chopp-order alerts

ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS event_date DATE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'budgets_status_check'
  ) THEN
    ALTER TABLE budgets
      ADD CONSTRAINT budgets_status_check
      CHECK (status IN ('open', 'concluded'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_budgets_status_event_date
  ON budgets (status, event_date);

COMMENT ON COLUMN budgets.event_date IS 'Date of the client event (party). Required for 7-day reminder.';
COMMENT ON COLUMN budgets.status IS 'open = active quote; concluded = closed.';
COMMENT ON COLUMN budgets.reminder_sent_at IS
  'Set when the team reminder was sent. Future cron: status=open AND event_date = CURRENT_DATE + 7 AND reminder_sent_at IS NULL.';
