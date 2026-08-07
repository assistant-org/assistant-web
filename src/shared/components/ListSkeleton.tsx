import React from "react";
import Skeleton from "./Skeleton";

interface ListSkeletonProps {
  variant: "table" | "cards";
  rows?: number;
  columns?: number;
}

export default function ListSkeleton({
  variant,
  rows = 5,
  columns = 4,
}: ListSkeletonProps) {
  if (variant === "cards") {
    return (
      <div
        className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700"
        role="status"
        aria-label="Carregando"
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" role="status" aria-label="Carregando">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr
              key={row}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              {Array.from({ length: columns }).map((_, col) => (
                <td key={col} className="px-6 py-4">
                  <Skeleton
                    className={`h-4 ${col === columns - 1 ? "w-8 ml-auto" : "w-full max-w-[8rem]"}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
