import { UseFormReturn } from 'react-hook-form';
import { CategoryFormSchema } from './schema';

export enum CategoryType {
  ENTRY = 'Entrada',
  OUTPUT = 'Saída',
}

export interface ICategory {
  id: string;
  name: string;
  type: CategoryType;
  status: 'active' | 'inactive';
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
}

export interface ICategoryFormProps {
    formMethods: UseFormReturn<CategoryFormSchema>;
    onSave: (data: CategoryFormSchema) => void;
    onCancel: () => void;
    isLoading: boolean;
}
