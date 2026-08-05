import { z } from "zod";

/** Coerce Select clear / empty into `""` so required strings show min(1) messages. */
export const nullToEmpty = (val: unknown) =>
  val === null || val === undefined ? "" : val;

/**
 * Required string from a Select (Zod 4-safe): accepts null/undefined from RHF defaults,
 * then enforces min(1) with a friendly message.
 */
export function requiredSelectString(message: string) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null ? "" : String(v)))
    .pipe(z.string().min(1, message));
}
