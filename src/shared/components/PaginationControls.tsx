import React from "react";
import { PageSize } from "../hooks/usePagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  pageSize: PageSize;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

const PAGE_SIZES: PageSize[] = [10, 20, 50];

export default function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  if (totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 px-1">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 justify-between">
        <span>
          {from}–{to} de {totalItems}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          className="bg-transparent border-b border-b border-gray-300 dark:border-gray-600 px-2 py-1 text-sm"
          style={{
            color: "var(--color-text-primary)",
            backgroundColor: "transparent",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
