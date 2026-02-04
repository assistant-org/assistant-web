import { useState, useEffect } from "react";
import { categoriesService } from "../services/categories/categories.service";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../services/categories/types";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as categorias
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await categoriesService.findAll();
      if (result.error) {
        setError(result.error);
      } else {
        setCategories(result.data || []);
      }
    } catch (err) {
      setError("Erro ao buscar categorias");
    } finally {
      setLoading(false);
    }
  };

  // Criar categoria
  const createCategory = async (categoryData: CreateCategoryRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await categoriesService.create(categoryData);
      if (result.error) {
        setError(result.error);
        return null;
      } else {
        await fetchCategories(); // Recarregar lista
        return result.data;
      }
    } catch (err) {
      setError("Erro ao criar categoria");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar categoria
  const updateCategory = async (id: string, updates: UpdateCategoryRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await categoriesService.update(id, updates);
      if (result.error) {
        setError(result.error);
        return null;
      } else {
        await fetchCategories(); // Recarregar lista
        return result.data;
      }
    } catch (err) {
      setError("Erro ao atualizar categoria");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Deletar categoria
  const deleteCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await categoriesService.delete(id);
      if (result.error) {
        setError(result.error);
        return false;
      } else {
        await fetchCategories(); // Recarregar lista
        return true;
      }
    } catch (err) {
      setError("Erro ao deletar categoria");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar categoria por ID
  const getCategoryById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await categoriesService.findById(id);
      if (result.error) {
        setError(result.error);
        return null;
      } else {
        return result.data;
      }
    } catch (err) {
      setError("Erro ao buscar categoria");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
};
