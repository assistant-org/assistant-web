export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "assistant-theme";

const THEME_COLORS: Record<AppTheme, string> = {
  light: "#f3f4f6",
  dark: "#111827",
};

const OVERLAY_COLOR = "#000000";

let overlayCount = 0;

function ensureThemeColorMeta(): HTMLMetaElement {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  return meta as HTMLMetaElement;
}

export function updateThemeColor(
  theme?: AppTheme,
  overlayOpen = false,
): void {
  if (typeof document === "undefined") return;
  const meta = ensureThemeColorMeta();
  if (overlayOpen) {
    meta.setAttribute("content", OVERLAY_COLOR);
    return;
  }
  const resolved = theme ?? getTheme();
  meta.setAttribute("content", THEME_COLORS[resolved]);
}

export function setOverlayThemeColor(open: boolean): void {
  if (open) {
    overlayCount += 1;
    if (overlayCount === 1) updateThemeColor(undefined, true);
    return;
  }
  overlayCount = Math.max(0, overlayCount - 1);
  if (overlayCount === 0) updateThemeColor(undefined, false);
}

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
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  updateThemeColor(theme, false);
}

export function toggleTheme(): AppTheme {
  const next: AppTheme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

if (typeof document !== "undefined") {
  document.documentElement.style.colorScheme = getTheme();
  updateThemeColor(getTheme(), false);
}
