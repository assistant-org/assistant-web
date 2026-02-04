export interface Category {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface PaginatedCategoriesResponse {
  data: Category[];
  total: number;
}
