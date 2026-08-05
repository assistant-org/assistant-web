import { UseFormReturn } from "react-hook-form";
import { Product } from "../../../shared/services/products/types";
import { ProductFormSchema } from "./schema";
import { PageSize } from "../../../shared/hooks/usePagination";

export interface IProductsPresentationProps {
  products: Product[];
  onOpenModal: (product?: Product) => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  editingProduct: Product | null;
  formMethods: UseFormReturn<ProductFormSchema>;
  onSave: (data: ProductFormSchema) => void;
  isLoading: boolean;
  onToggleActive: (product: Product) => void;
  onDelete: (product: Product) => void;
  isDeleteModalOpen: boolean;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
  productToDelete: Product | null;
  page: number;
  pageSize: PageSize;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

export interface IProductFormProps {
  formMethods: UseFormReturn<ProductFormSchema>;
  onSave: (data: ProductFormSchema) => void;
  onCancel: () => void;
  isLoading: boolean;
}
