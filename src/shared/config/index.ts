// By defining the ImportMeta interface, we inform TypeScript about the structure of `import.meta.env`,
// resolving the error about 'env' not existing on type 'ImportMeta'. This is a common
// workaround when Vite's client types are not automatically recognized.

// FIX: The original interface declarations were local to this module. By using `declare global`,
// we correctly augment the global `ImportMeta` type, making TypeScript aware of `import.meta.env`.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_URL?: string;
      readonly VITE_SUPABASE_URL?: string;
      readonly VITE_SUPABASE_ANON_KEY?: string;
    };
  }
}

import { createClient } from "@supabase/supabase-js";

const config = {
  API: {
    BASE_URL: import.meta.env?.VITE_API_URL || "https://api.example.com",
    TOKEN_NAME: "app_token",
  },
  SUPABASE: {
    URL: import.meta.env?.VITE_SUPABASE_URL || "",
    ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || "",
  },
};

export const supabase = createClient(
  config.SUPABASE.URL,
  config.SUPABASE.ANON_KEY,
);

export default config;
