import { useCallback, useEffect, useRef, useState } from "react";
import { ApiResponse, PaginatedResult } from "../services/types";
import { PageSize } from "./usePagination";

export type { PageSize };

type FetchFn<TFilters, TItem> = (
  params: TFilters & { page: number; pageSize: number },
) => Promise<ApiResponse<PaginatedResult<TItem>>>;

interface UseServerListOptions<TFilters> {
  initialPageSize?: PageSize;
  initialFilters: TFilters;
  /** When false, skip the first automatic fetch (caller triggers via reload). Default true. */
  autoFetch?: boolean;
}

/**
 * Server-driven list: each page / pageSize / filter change triggers a new request.
 */
export function useServerList<TFilters extends object, TItem>(
  fetchFn: FetchFn<TFilters, TItem>,
  options: UseServerListOptions<TFilters>,
) {
  const { initialPageSize = 10, initialFilters, autoFetch = true } = options;

  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState<PageSize>(initialPageSize);
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);
  const [items, setItems] = useState<TItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const requestIdRef = useRef(0);

  const load = useCallback(
    async (next: { page: number; pageSize: number; filters: TFilters }) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      const result = await fetchFnRef.current({
        ...next.filters,
        page: next.page,
        pageSize: next.pageSize,
      });

      if (requestId !== requestIdRef.current) return;

      if (result.error) {
        setError(result.error);
        setItems([]);
        setTotal(0);
      } else {
        setItems(result.data?.items ?? []);
        setTotal(result.data?.total ?? 0);
      }
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    if (!autoFetch) return;
    void load({ page, pageSize, filters });
  }, [page, pageSize, filters, load, autoFetch]);

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next));
  }, []);

  const setPageSize = useCallback((size: PageSize) => {
    setPageSizeState(size);
    setPageState(1);
  }, []);

  const setFilters = useCallback((next: TFilters | ((prev: TFilters) => TFilters)) => {
    setFiltersState(next);
    setPageState(1);
  }, []);

  const reload = useCallback(() => {
    void load({ page, pageSize, filters });
  }, [load, page, pageSize, filters]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    total,
    page: Math.min(page, totalPages),
    pageSize,
    totalPages,
    filters,
    loading,
    error,
    setPage,
    setPageSize,
    setFilters,
    reload,
  };
}
