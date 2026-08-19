/**
 * Verifies whether budgets.event_location exists in the remote Supabase project.
 * Usage: node scripts/verify-event-location.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
);

const { error } = await supabase.from("budgets").select("event_location").limit(1);

if (!error) {
  console.log("OK: column budgets.event_location exists");
  process.exit(0);
}

if (
  error.code === "PGRST204" ||
  error.code === "42703" ||
  error.message?.includes("event_location")
) {
  console.log("MISSING: column budgets.event_location does not exist");
  console.log("");
  console.log("Run this SQL in Supabase Dashboard → SQL Editor:");
  console.log("");
  console.log(`ALTER TABLE budgets
  ADD COLUMN IF NOT EXISTS event_location TEXT;

COMMENT ON COLUMN budgets.event_location IS
  'Venue/location where the client event will take place.';`);
  process.exit(1);
}

console.error("ERROR:", error.code, error.message);
process.exit(1);
