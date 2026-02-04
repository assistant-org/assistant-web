import { supabase } from "../../config";
import { CreateCategoryRequest, UpdateCategoryRequest } from "./types";
import {
  CategoryResponse,
  CategoriesListResponse,
  PaginatedCategoriesListResponse,
  ApiResponse,
} from "./models/response/response";

export class CategoriesService {
  private tableName = "categories";

  /**
   * Cria uma nova categoria
   */
  async create(
    category: CreateCategoryRequest,
  ): Promise<ApiResponse<CategoryResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([category])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca todas as categorias
   */
  async findAll(): Promise<ApiResponse<CategoriesListResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca uma categoria por ID
   */
  async findById(id: string): Promise<ApiResponse<CategoryResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca categorias por nome (filtro)
   */
  async findByName(name: string): Promise<ApiResponse<CategoriesListResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .ilike("name", `%${name}%`)
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Atualiza uma categoria
   */
  async update(
    id: string,
    updates: UpdateCategoryRequest,
  ): Promise<ApiResponse<CategoryResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Deleta uma categoria
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Conta o total de categorias
   */
  async count(): Promise<{ count: number | null; error: string | null }> {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true });

      if (error) {
        return { count: null, error: error.message };
      }

      return { count, error: null };
    } catch (err) {
      return { count: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca categorias com paginação
   */
  async findPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<PaginatedCategoriesListResponse>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: { data, total: count || 0 }, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }
}

// Exporta uma instância singleton da service
export const categoriesService = new CategoriesService();

/*
EXEMPLO DE USO:

import { categoriesService } from '@/shared/services/categories/categories.service';

// Criar uma nova categoria
const createCategory = async () => {
  const result = await categoriesService.create({
    name: 'Nova Categoria',
    description: 'Descrição da categoria',
    color: '#FF5733',
    icon: 'category-icon'
  });

  if (result.error) {
    console.error('Erro ao criar:', result.error);
  } else {
    console.log('Categoria criada:', result.data);
  }
};

// Buscar todas as categorias
const getAllCategories = async () => {
  const result = await categoriesService.findAll();
  if (result.error) {
    console.error('Erro ao buscar:', result.error);
  } else {
    console.log('Categorias:', result.data);
  }
};

// Buscar por ID
const getCategoryById = async (id: string) => {
  const result = await categoriesService.findById(id);
  // ...
};

// Atualizar uma categoria
const updateCategory = async (id: string) => {
  const result = await categoriesService.update(id, {
    name: 'Nome Atualizado',
    color: '#00FF00'
  });
  // ...
};

// Deletar uma categoria
const deleteCategory = async (id: string) => {
  const result = await categoriesService.delete(id);
  // ...
};

// Buscar com paginação
const getPaginatedCategories = async () => {
  const result = await categoriesService.findPaginated(1, 10);
  // ...
};
*/
