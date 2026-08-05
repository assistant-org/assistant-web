import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductsPresentation from "./presentation";
import { productFormSchema, ProductFormSchema } from "./schema";
import { IProductsPresentationProps } from "./types";
import { productsService } from "../../../shared/services/products/products.service";
import { Product } from "../../../shared/services/products/types";
import { useToast } from "../../../shared/context/ToastContext";
import { useServerList } from "../../../shared/hooks/useServerList";

type ProductListFilters = { includeInactive: boolean };

export default function ProductsContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchProducts = useCallback(
    (params: ProductListFilters & { page: number; pageSize: number }) =>
      productsService.findPage({
        includeInactive: params.includeInactive,
        page: params.page,
        pageSize: params.pageSize,
      }),
    [],
  );

  const list = useServerList(fetchProducts, {
    initialFilters: { includeInactive: true },
    initialPageSize: 10,
  });

  useEffect(() => {
    if (list.error) toastError(list.error);
  }, [list.error, toastError]);

  const formMethods = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      defaultUnitValue: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (editingProduct) {
      formMethods.reset({
        name: editingProduct.name,
        defaultUnitValue: editingProduct.defaultUnitValue ?? 0,
        active: editingProduct.active,
      });
    } else {
      formMethods.reset({
        name: "",
        defaultUnitValue: 0,
        active: true,
      });
    }
  }, [editingProduct, isModalOpen, formMethods]);

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (data: ProductFormSchema) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        const result = await productsService.update(editingProduct.id, {
          name: data.name,
          defaultUnitValue: data.defaultUnitValue,
        });
        if (result.error) {
          toastError(result.error);
        } else {
          list.reload();
          handleCloseModal();
          success("Produto atualizado com sucesso!");
        }
      } else {
        const result = await productsService.create({
          name: data.name,
          defaultUnitValue: data.defaultUnitValue,
          active: true,
        });
        if (result.error) {
          toastError(result.error);
        } else {
          list.reload();
          handleCloseModal();
          success("Produto criado com sucesso!");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro interno";
      toastError(message);
    }
    setIsSaving(false);
  };

  const handleToggleActive = async (product: Product) => {
    const result = await productsService.setActive(product.id, !product.active);
    if (result.error) {
      toastError(result.error);
    } else {
      list.reload();
      success(product.active ? "Produto desativado." : "Produto ativado.");
    }
  };

  const handleRequestDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const result = await productsService.delete(productToDelete.id);
    if (result.error) {
      toastError(result.error);
    } else {
      list.reload();
      success("Produto removido com sucesso!");
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
    setIsDeleting(false);
  };

  const presentationProps: IProductsPresentationProps = {
    products: list.items,
    onOpenModal: handleOpenModal,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingProduct,
    formMethods,
    onSave: handleSave,
    isLoading: list.loading || isSaving,
    onToggleActive: handleToggleActive,
    onDelete: handleRequestDelete,
    isDeleteModalOpen,
    onCloseDeleteModal: handleCloseDeleteModal,
    onConfirmDelete: handleConfirmDelete,
    isDeleting,
    productToDelete,
    page: list.page,
    pageSize: list.pageSize,
    totalItems: list.total,
    totalPages: list.totalPages,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  };

  return <ProductsPresentation {...presentationProps} />;
}
