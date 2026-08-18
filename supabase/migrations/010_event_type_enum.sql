-- Allow event types sent by the app (EventType.CLOSED / EventType.SINGLE).
ALTER TYPE "EVENT_TYPE_ENUM" ADD VALUE IF NOT EXISTS 'fechado';
ALTER TYPE "EVENT_TYPE_ENUM" ADD VALUE IF NOT EXISTS 'avulso';
