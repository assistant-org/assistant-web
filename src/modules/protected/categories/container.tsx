import React, { useCallback, useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoriesPresentation from "./presentation";
import { categoryFormSchema, CategoryFormSchema } from "./schema";
import { ICategoriesPresentationProps, ICategory } from "./types";
import { categoriesService } from "../../../shared/services/categories/categories.service";
import { useToast } from "../../../shared/context/ToastContext";
import { useServerList } from "../../../shared/hooks/useServerList";
import { PaginatedResult } from "../../../shared/services/types";

type CategoryListFilters = Record<string, never>;

export default function CategoriesContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchCategories = useCallback(
    async (params: CategoryListFilters & { page: number; pageSize: number }) => {
      const result = await categoriesService.findPage({
        page: params.page,
        pageSize: params.pageSize,
      });
      if (result.error || !result.data) {
        return { data: null, error: result.error };
      }
      return {
        data: {
          ...result.data,
          items: result.data.items as ICategory[],
        } as PaginatedResult<ICategory>,
        error: null,
      };
    },
    [],
  );

  const list = useServerList(fetchCategories, {
    initialFilters: {},
    initialPageSize: 10,
  });

  useEffect(() => {
    if (list.error) toastError(list.error);
  }, [list.error, toastError]);

  const formMethods = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema) as Resolver<CategoryFormSchema>,
    defaultValues: {
      color: "#000000",
    },
  });

  useEffect(() => {
    if (editingCategory) {
      formMethods.reset(editingCategory);
    } else {
      formMethods.reset({
        name: "",
        type: undefined,
        allowsSingleEvent: false,
        color: "#000000",
        description: "",
      });
    }
  }, [editingCategory, isModalOpen, formMethods]);

  const handleOpenModal = (category?: ICategory) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async (data: CategoryFormSchema) => {
    setIsSaving(true);
    try {
      if (editingCategory) {
        const result = await categoriesService.update(editingCategory.id, data);
        if (result.error) {
          toastError(result.error);
        } else {
          list.reload();
          handleCloseModal();
          success("Categoria atualizada com sucesso!");
        }
      } else {
        const result = await categoriesService.create({
          ...data,
          status: true,
        });
        if (result.error) {
          toastError(result.error);
        } else {
          list.reload();
          handleCloseModal();
          success("Categoria criada com sucesso!");
        }
      }
    } catch {
      toastError("Erro interno do servidor");
    }
    setIsSaving(false);
  };

  const handleToggleStatus = async (id: string) => {
    const category = list.items.find((c) => c.id === id);
    if (!category) return;
    const result = await categoriesService.update(id, {
      status: !category.status,
    });
    if (result.error) {
      toastError(result.error);
    } else {
      list.reload();
      success("Status da categoria atualizado!");
    }
  };

  const presentationProps: ICategoriesPresentationProps = {
    categories: list.items,
    onOpenModal: handleOpenModal,
    onToggleStatus: handleToggleStatus,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingCategory,
    formMethods,
    onSave: handleSaveCategory,
    isLoading: list.loading || isSaving,
    page: list.page,
    pageSize: list.pageSize,
    totalItems: list.total,
    totalPages: list.totalPages,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  };

  return <CategoriesPresentation {...presentationProps} />;
}
