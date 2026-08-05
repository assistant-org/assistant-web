/**
 * Date-only helpers (YYYY-MM-DD). Avoid `new Date("YYYY-MM-DD")` which
 * parses as UTC midnight and shifts −1 day in Brazil (UTC−3).
 */

/** Format a date-only ISO string (or Date) as pt-BR without timezone shift. */
export function formatDateBR(value?: string | Date | null): string {
  if (value == null || value === "") return "-";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "-";
    return value.toLocaleDateString("pt-BR");
  }
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString("pt-BR");
  }
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
}

/** Today's calendar date in local timezone as YYYY-MM-DD. */
export function todayISODate(ref: Date = new Date()): string {
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, "0");
  const day = String(ref.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
