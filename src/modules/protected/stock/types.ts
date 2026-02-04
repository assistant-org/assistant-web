import { UseFormReturn } from 'react-hook-form';
import { StockItemFormSchema, StockExitFormSchema } from './schema';

export enum StockCategory {
  PILSEN = 'Pilsen',
  IPA = 'IPA',
  WEISS = 'Weiss',
  PORTER = 'Porter',
  LAGER = 'Lager',
}

export enum StockStatus {
  ACTIVE = 'ativo',
  CLOSED = 'encerrado',
}

export enum ExitReason {
    EVENT = 'evento',
    LOSS = 'perda',
    INTERNAL = 'consumo_interno'
}

export interface IStockMovement {
    id: string;
    date: string;
    quantity: number;
    reason: ExitReason;
}

export interface IStockItem {
  id: string;
  productName: string;
  category: StockCategory;
  entryDate: string;
  expiryDate: string;
  
  unitLiters: number;
  unitCount: number;
  // FIX: Add unitPrice to the stock item interface.
  unitPrice: number;
  initialQuantityLiters: number;
  availableQuantityLiters: number;

  status: StockStatus;
  closureDate?: string;
  observations?: string;
  movements?: IStockMovement[];
}

export interface IStockFilters {
    productName: string;
    category: string;
    status: string;
    expiryDate: string;
}

export interface IStockPresentationProps {
    stockItems: IStockItem[];
    filters: IStockFilters;
    onFilterChange: (field: keyof IStockFilters, value: string) => void;
    onClearFilters: () => void;
    
    onOpenEditModal: (item?: IStockItem) => void;

    // Details Modal Props
    isDetailsModalOpen: boolean;
    onOpenDetailsModal: (item: IStockItem) => void;
    onCloseDetailsModal: () => void;
    selectedItemForDetails: IStockItem | null;
    
    // Edit Modal Props
    isEditModalOpen: boolean;
    onCloseEditModal: () => void;
    editingItem: IStockItem | null;
    itemFormMethods: UseFormReturn<StockItemFormSchema>;
    onSaveItem: (data: StockItemFormSchema) => void;
    isSavingItem: boolean;

    // Exit Form Props (within Edit Modal)
    exitFormMethods: UseFormReturn<StockExitFormSchema>;
    onSaveExit: (data: StockExitFormSchema) => void;
    isSavingExit: boolean;
}

export interface IManageStockItemFormProps {
    itemFormMethods: UseFormReturn<StockItemFormSchema>;
    onSaveItem: (data: StockItemFormSchema) => void;
    onCancel: () => void;
    isSavingItem: boolean;
    
    exitFormMethods: UseFormReturn<StockExitFormSchema>;
    onSaveExit: (data: StockExitFormSchema) => void;
    isSavingExit: boolean;

    currentItem: IStockItem | null;
}

export interface IStockExitFormProps {
    formMethods: UseFormReturn<StockExitFormSchema>;
    onSave: (data: StockExitFormSchema) => void;
    isLoading: boolean;
    currentItem: IStockItem | null;
}

export interface IStockItemDetailsProps {
    item: IStockItem | null;
}