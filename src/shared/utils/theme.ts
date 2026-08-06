export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "assistant-theme";

export function getTheme(): AppTheme {
  if (typeof document === "undefined") return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

export function setTheme(theme: AppTheme): void {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function toggleTheme(): AppTheme {
  const next: AppTheme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
