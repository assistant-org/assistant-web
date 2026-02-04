import { Category, PaginatedCategoriesResponse } from "../../types";

export type CategoryResponse = Category;

export type CategoriesListResponse = Category[];

export type PaginatedCategoriesListResponse = PaginatedCategoriesResponse;

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
