import React, { useCallback, useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoriesPresentation from "./presentation";
import { categoryFormSchema, CategoryFormSchema } from "./schema";
import {
  CATEGORY_TYPE_COLORS,
  CategoryType,
  ICategoriesPresentationProps,
  ICategory,
} from "./types";
import { categoriesService } from "../../../shared/services/categories/categories.service";
import { useToast } from "../../../shared/context/ToastContext";
import { useServerList } from "../../../shared/hooks/useServerList";
import { PaginatedResult } from "../../../shared/services/types";

type CategoryListFilters = Record<string, never>;

function colorForType(type?: CategoryType): string {
  if (type === CategoryType.EXPENSE) return CATEGORY_TYPE_COLORS[CategoryType.EXPENSE];
  return CATEGORY_TYPE_COLORS[CategoryType.INCOME];
}

export default function CategoriesContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
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
      type: CategoryType.INCOME,
      color: CATEGORY_TYPE_COLORS[CategoryType.INCOME],
      allowsSingleEvent: true,
    },
  });

  useEffect(() => {
    if (editingCategory) {
      formMethods.reset({
        ...editingCategory,
        allowsSingleEvent: true,
        color: colorForType(editingCategory.type),
      });
    } else {
      formMethods.reset({
        name: "",
        type: CategoryType.INCOME,
        allowsSingleEvent: true,
        color: CATEGORY_TYPE_COLORS[CategoryType.INCOME],
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
    const payload: CategoryFormSchema = {
      ...data,
      allowsSingleEvent: true,
      color: colorForType(data.type),
    };
    try {
      if (editingCategory) {
        const result = await categoriesService.update(editingCategory.id, payload);
        if (result.error) {
          toastError(result.error);
        } else {
          list.reload();
          handleCloseModal();
          success("Categoria atualizada com sucesso!");
        }
      } else {
        const result = await categoriesService.create({
          ...payload,
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

  const handleOpenDelete = (category: ICategory) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    const result = await categoriesService.delete(categoryToDelete.id);
    setIsDeleting(false);
    if (result.error) {
      toastError(result.error);
      return;
    }
    handleCloseDelete();
    list.reload();
    success("Categoria excluída com sucesso!");
  };

  const presentationProps: ICategoriesPresentationProps = {
    categories: list.items,
    onOpenModal: handleOpenModal,
    onToggleStatus: handleToggleStatus,
    onDelete: handleOpenDelete,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingCategory,
    formMethods,
    onSave: handleSaveCategory,
    isLoading: isSaving,
    isListLoading: list.loading,
    isDeleteModalOpen,
    categoryToDelete,
    onCloseDelete: handleCloseDelete,
    onConfirmDelete: handleConfirmDelete,
    isDeleting,
    page: list.page,
    pageSize: list.pageSize,
    totalItems: list.total,
    totalPages: list.totalPages,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  };

  return <CategoriesPresentation {...presentationProps} />;
}
