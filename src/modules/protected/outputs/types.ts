import { UseFormReturn } from "react-hook-form";
import { OutputFormSchema } from "./schema";

export enum OutputType {
  FIXED = "fixa",
  VARIABLE = "variavel",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  PIX = "PIX",
  DEBIT_CARD = "DEBIT_CARD",
  MONEY = "MONEY",
}

export interface IOutput {
  id: string;
  date: string;
  category: string;
  type?: OutputType;
  paymentMethod: PaymentMethod;
  value: number;
  description?: string;
  isRecurring?: boolean;
  recurrenceDay?: number;
  event?: string;
}

export interface IFilters {
  startDate: string;
  endDate: string;
  category: string;
  paymentMethod: string;
}

export interface IOutputsPresentationProps {
  outputs: IOutput[];
  filters: IFilters;
  onFilterChange: (field: keyof IFilters, value: string) => void;
  onClearFilters: () => void;
  onOpenModal: (output?: IOutput) => void;
  onDeleteOutput: (id: string) => void;
  onViewDetails: (output: IOutput) => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  editingOutput: IOutput | null;
  viewingOutput: IOutput | null;
  formMethods: UseFormReturn<OutputFormSchema>;
  onSave: (data: OutputFormSchema) => void;
  isLoading: boolean;
  categories: any[]; // Adicionar tipo correto depois
  events: any[]; // Adicionar tipo correto depois
}

export interface IOutputFormProps {
  formMethods: UseFormReturn<OutputFormSchema>;
  onSave: (data: OutputFormSchema) => void;
  onCancel: () => void;
  isLoading: boolean;
  categories: any[];
  events: any[];
}
