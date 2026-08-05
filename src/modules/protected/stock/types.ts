import { UseFormReturn } from "react-hook-form";
import { Product } from "../../../shared/services/products/types";
import { StockBatch, StockBatchStatus } from "../../../shared/services/stock/types";
import { StockFormValues } from "./schema";
import { PageSize } from "../../../shared/hooks/usePagination";

export interface IStockFilters {
  productId: string;
  status: StockBatchStatus | "all";
  expiryBefore: string;
}

export interface IProductSummary {
  productId: string;
  productName: string;
  totalAvailable: number;
}

export interface IEventOption {
  id: string;
  name: string;
}

export interface IStockPresentationProps {
  products: Product[];
  batches: StockBatch[];
  allBatches: StockBatch[];
  events: IEventOption[];
  summaries: IProductSummary[];
  filters: IStockFilters;
  onFilterChange: (field: keyof IStockFilters, value: string) => void;
  onClearFilters: () => void;

  onOpenMovementModal: () => void;
  isMovementModalOpen: boolean;
  onCloseMovementModal: () => void;
  movementFormMethods: UseFormReturn<StockFormValues>;
  onSaveMovement: (data: StockFormValues) => void;
  isSavingMovement: boolean;

  isDetailsModalOpen: boolean;
  selectedBatch: StockBatch | null;
  onOpenDetails: (batch: StockBatch) => void;
  onCloseDetails: () => void;

  onOpenEdit: (batch: StockBatch) => void;
  isEditModalOpen: boolean;
  onCloseEdit: () => void;
  onSaveBatchEdit: (updates: {
    expiryDate?: string | null;
    observations?: string | null;
    unitValue?: number;
  }) => void;
  isDeleteModalOpen: boolean;
  onOpenDelete: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  isDeletingBatch: boolean;

  isLoading: boolean;

  page: number;
  pageSize: PageSize;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}
