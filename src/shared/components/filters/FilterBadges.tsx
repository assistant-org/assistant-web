import React from "react";
import { X } from "lucide-react";

export interface FilterBadgeChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FilterBadgesProps {
  chips: FilterBadgeChip[];
}

export default function FilterBadges({ chips }: FilterBadgesProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remover filtro ${chip.label}`}
            className="hover:text-indigo-900 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
