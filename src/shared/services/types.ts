export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/** 1-based page params for list endpoints. */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
