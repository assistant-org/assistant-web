import { useEffect } from "react";
import { setOverlayThemeColor } from "../utils/theme";

export function useOverlayThemeColor(isOpen: boolean): void {
  useEffect(() => {
    if (!isOpen) return;
    setOverlayThemeColor(true);
    return () => setOverlayThemeColor(false);
  }, [isOpen]);
}
