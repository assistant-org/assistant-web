import { UseFormReturn } from "react-hook-form";
import { CategoryFormSchema } from "./schema";
import { PageSize } from "../../../shared/hooks/usePagination";

export enum CategoryType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface ICategory {
  id: string;
  name: string;
  type: CategoryType;
  status: boolean;
  allowsSingleEvent?: boolean;
  color?: string;
  description?: string;
}

export interface ICategoriesPresentationProps {
  categories: ICategory[];
  onOpenModal: (category?: ICategory) => void;
  onToggleStatus: (id: string) => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  editingCategory: ICategory | null;
  formMethods: UseFormReturn<CategoryFormSchema>;
  onSave: (data: CategoryFormSchema) => void;
  isLoading: boolean;
  page: number;
  pageSize: PageSize;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

export interface ICategoryFormProps {
  formMethods: UseFormReturn<CategoryFormSchema>;
  onSave: (data: CategoryFormSchema) => void;
  onCancel: () => void;
  isLoading: boolean;
}
