import { UseFormReturn } from "react-hook-form";
import {
  Transaction,
  TransactionType,
  PaymentMethod,
} from "../../../shared/services/transactions/types";
import { Account } from "../../../shared/services/accounts/types";
import { Category } from "../../../shared/services/categories/types";

export interface IEventOption {
  id: string;
  name: string;
}

/**
 * Flat shape used by the form/RHF. Validation still runs through the shared
 * `transactionSchema` discriminated union — this flat type just avoids the
 * friction of typing `register()`/`watch()` against a union type.
 */
export interface TransactionFormValues {
  type: TransactionType;
  date: string;
  value: number;
  description?: string;
  categoryId?: string;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  paymentMethod?: PaymentMethod | null;
  eventId?: string | null;
  /** Compra de Chopp → stock entry fields */
  stockProductId?: string | null;
  stockQuantityLiters?: number | null;
  stockUnitValue?: number | null;
  stockExpiryDate?: string | null;
}

export interface IFinancialFilters {
  startDate: string;
  endDate: string;
  type: string;
  categoryId: string;
  accountId: string;
  origin: string;
  eventId: string;
  status: string;
}

export interface IFinancialTotals {
  income: number;
  expense: number;
  balance: number;
}

export interface IFinancialPresentationProps {
  transactions: Transaction[];
  totals: IFinancialTotals;
  filters: IFinancialFilters;
  onFilterChange: (field: keyof IFinancialFilters, value: string) => void;
  onClearFilters: () => void;
  onOpenModal: (transaction?: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewDetails: (transaction: Transaction) => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  editingTransaction: Transaction | null;
  viewingTransaction: Transaction | null;
  onCloseDetails: () => void;
  formMethods: UseFormReturn<TransactionFormValues>;
  onSave: (data: TransactionFormValues) => void;
  isLoading: boolean;
  categories: Category[];
  accounts: Account[];
  products: import("../../../shared/services/products/types").Product[];
  events: IEventOption[];
  eventsEnabled: boolean;
  isDeleteModalOpen: boolean;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
  getCategoryName: (id?: string | null) => string;
  getAccountName: (id?: string | null) => string;
  getEventName: (id?: string | null) => string | null;
  page: number;
  pageSize: import("../../../shared/hooks/usePagination").PageSize;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (
    size: import("../../../shared/hooks/usePagination").PageSize,
  ) => void;
}

export interface ITransactionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formMethods: UseFormReturn<TransactionFormValues>;
  onSave: (data: TransactionFormValues) => void;
  isLoading: boolean;
  categories: Category[];
  accounts: Account[];
  events: IEventOption[];
  eventsEnabled: boolean;
  products: import("../../../shared/services/products/types").Product[];
}

export interface ITransactionFiltersProps {
  filters: IFinancialFilters;
  onFilterChange: (field: keyof IFinancialFilters, value: string) => void;
  onApply: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  categories: Category[];
  accounts: Account[];
  events: IEventOption[];
  eventsEnabled: boolean;
}

export interface ITransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onViewDetails: (transaction: Transaction) => void;
  getCategoryName: (id?: string | null) => string;
  getAccountName: (id?: string | null) => string;
}

export interface ITransactionDetailsProps {
  transaction: Transaction;
  onClose: () => void;
  getCategoryName: (id?: string | null) => string;
  getAccountName: (id?: string | null) => string;
  getEventName: (id?: string | null) => string | null;
}
