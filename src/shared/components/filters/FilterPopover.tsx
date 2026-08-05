import React, { useEffect, useRef } from "react";
import FilterButton from "../FilterButton";

interface FilterPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hasActiveFilters: boolean;
  children: React.ReactNode;
}

export default function FilterPopover({
  isOpen,
  onOpenChange,
  hasActiveFilters,
  children,
}: FilterPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onOpenChange]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <FilterButton onClick={() => onOpenChange(!isOpen)} hasActiveFilters={hasActiveFilters} />
      {isOpen && (
        <div className="absolute right-0 z-40 mt-2 w-96 max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-4">
          {children}
        </div>
      )}
    </div>
  );
}
