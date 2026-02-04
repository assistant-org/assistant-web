import { UseFormReturn } from 'react-hook-form';
import { OutputFormSchema } from './schema';

export enum OutputType {
  FIXED = 'fixa',
  VARIABLE = 'variavel',
}

export enum PaymentMethod {
    CASH = 'dinheiro',
    PIX = 'pix',
    CARD = 'cartao',
    BANK_TRANSFER = 'transferencia',
}

export interface IOutput {
  id: string;
  date: string;
  category: string;
  type: OutputType;
  paymentMethod: PaymentMethod;
  value: number;
  description?: string;
  isRecurring?: boolean;
  recurrenceDay?: number;
}

export interface IFilters {
    startDate: string;
    endDate: string;
    category: string;
    type: string;
    paymentMethod: string;
}

export interface IOutputsPresentationProps {
    outputs: IOutput[];
    filters: IFilters;
    onFilterChange: (field: keyof IFilters, value: string) => void;
    onClearFilters: () => void;
    onOpenModal: (output?: IOutput) => void;
    onDeleteOutput: (id: string) => void;
    isModalOpen: boolean;
    onCloseModal: () => void;
    editingOutput: IOutput | null;
    formMethods: UseFormReturn<OutputFormSchema>;
    onSave: (data: OutputFormSchema) => void;
    isLoading: boolean;
}

export interface IOutputFormProps {
    formMethods: UseFormReturn<OutputFormSchema>;
    onSave: (data: OutputFormSchema) => void;
    onCancel: () => void;
    isLoading: boolean;
}
