import { useMemo, useState } from "react";

/** Page sizes supported by list UIs and PaginationControls. */
export type PageSize = 10 | 20 | 50;

/**
 * @deprecated Prefer `useServerList` for table listings (server-side page/filter).
 * Kept only for rare client-only slices.
 */
export function usePagination<T>(items: T[], initialPageSize: PageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const changePageSize = (size: PageSize) => {
    setPageSize(size);
    setPage(1);
  };

  const goToPage = (next: number) => {
    setPage(Math.max(1, Math.min(next, totalPages)));
  };

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    setPage: goToPage,
    setPageSize: changePageSize,
  };
}
