import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface ActionMenuItem {
  key: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: "left" | "right";
  "aria-label"?: string;
}

/**
 * Anchored "…" menu (not a centered modal). Closes on outside click / Escape.
 */
export default function ActionMenu({
  items,
  align = "right",
  "aria-label": ariaLabel = "Mais ações",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-flex" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute z-30 mt-1 min-w-[11rem] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm disabled:opacity-40 ${
                item.danger
                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
