import React, { useState, useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoriesPresentation from "./presentation";
import { categoryFormSchema, CategoryFormSchema } from "./schema";
import { ICategoriesPresentationProps, ICategory } from "./types";
import { categoriesService } from "../../../shared/services/categories/categories.service";
import { useToast } from "../../../shared/context/ToastContext";

export default function CategoriesContainer() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const formMethods = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema) as Resolver<CategoryFormSchema>,
    defaultValues: {
      color: "#000000",
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    const result = await categoriesService.findAll();
    if (result.error) {
      toastError(result.error);
    } else {
      setCategories(result.data || []);
    }
    setIsLoading(false);
  };

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
    setIsLoading(true);
    setError(null);
    try {
      if (editingCategory) {
        const result = await categoriesService.update(editingCategory.id, data);
        if (result.error) {
          toastError(result.error);
        } else {
          await loadCategories();
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
          await loadCategories();
          handleCloseModal();
          success("Categoria criada com sucesso!");
        }
      }
    } catch (err) {
      setError("Erro interno do servidor");
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    setError(null);
    const result = await categoriesService.update(id, {
      status: !category.status,
    });
    if (result.error) {
      toastError(result.error);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: !c.status } : c)),
      );
      success("Status da categoria atualizado!");
    }
  };

  const presentationProps: ICategoriesPresentationProps = {
    categories,
    onOpenModal: handleOpenModal,
    onToggleStatus: handleToggleStatus,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingCategory,
    formMethods,
    onSave: handleSaveCategory,
    isLoading,
  };

  return <CategoriesPresentation {...presentationProps} />;
}
