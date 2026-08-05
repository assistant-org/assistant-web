/**
 * Operational billing cycle: day 20 of month → day 20 of next month.
 * Used as the default dashboard period ("Este ciclo").
 */

export type DashboardPeriodKey =
  | "cycle"
  | "today"
  | "7days"
  | "month"
  | "year"
  | "custom";

export interface DateRange {
  startDate: string;
  endDate: string;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Cycle containing `ref`: from day 20 of the cycle-start month through day 20 of the next month (exclusive end of day 20 end). */
export function getCycleRange(ref: Date = new Date()): DateRange {
  const day = ref.getDate();
  const year = ref.getFullYear();
  const month = ref.getMonth();

  let start: Date;
  let end: Date;

  if (day >= 20) {
    start = new Date(year, month, 20);
    end = new Date(year, month + 1, 20);
  } else {
    start = new Date(year, month - 1, 20);
    end = new Date(year, month, 20);
  }

  return { startDate: toISODate(start), endDate: toISODate(end) };
}

export function getPeriodRange(
  key: DashboardPeriodKey,
  custom?: Partial<DateRange>,
  ref: Date = new Date(),
): DateRange {
  const today = startOfDay(ref);

  switch (key) {
    case "cycle":
      return getCycleRange(ref);
    case "today":
      return { startDate: toISODate(today), endDate: toISODate(today) };
    case "7days": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { startDate: toISODate(start), endDate: toISODate(today) };
    }
    case "month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
    case "year": {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
    case "custom":
      return {
        startDate: custom?.startDate || toISODate(today),
        endDate: custom?.endDate || toISODate(today),
      };
    default:
      return getCycleRange(ref);
  }
}

export function isDateInRange(dateStr: string, range: DateRange): boolean {
  if (!dateStr) return false;
  const d = dateStr.slice(0, 10);
  return d >= range.startDate && d <= range.endDate;
}

export const PERIOD_OPTIONS: { key: DashboardPeriodKey; label: string }[] = [
  { key: "cycle", label: "Este ciclo" },
  { key: "today", label: "Hoje" },
  { key: "7days", label: "7 dias" },
  { key: "month", label: "Mês" },
  { key: "year", label: "Ano" },
  { key: "custom", label: "Personalizado" },
];
