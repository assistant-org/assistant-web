import React from "react";
import { ChevronDown } from "lucide-react";

interface FilterAccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string | null;
  children: React.ReactNode;
}

export default function FilterAccordionSection({
  title,
  isOpen,
  onToggle,
  badge,
  children,
}: FilterAccordionSectionProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
          {badge && (
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}
