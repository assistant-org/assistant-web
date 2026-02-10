export interface Category {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: string; // 'Entrada' | 'Saída'
  status: boolean; // true = active, false = inactive
  allowsSingleEvent?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  type: string;
  status: boolean;
  allowsSingleEvent?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  type?: string;
  status?: boolean;
  allowsSingleEvent?: boolean;
}

export interface PaginatedCategoriesResponse {
  data: Category[];
  total: number;
}
