import { PaginationParams, PaginatedResult } from "./types";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;

export function normalizePagination(params?: PaginationParams): {
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, params?.page ?? DEFAULT_PAGE);
  const pageSize = Math.max(1, params?.pageSize ?? DEFAULT_PAGE_SIZE);
  return { page, pageSize };
}

/** Inclusive range for Supabase `.range(from, to)`. */
export function toRange(page: number, pageSize: number): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
  };
}
