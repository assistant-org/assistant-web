import { UseFormReturn } from 'react-hook-form';
import { EntryFormSchema } from './schema';
import { IStockItem } from '../stock/types';

export enum EventType {
  CLOSED = 'fechado',
  SINGLE = 'avulso',
}

export enum PaymentMethod {
    CASH = 'dinheiro',
    PIX = 'pix',
    CARD = 'cartao',
}

export interface IBeerControl {
  stockItemId: string;
  quantityTaken: number;
  quantityReturned: number;
}

export interface IEntry {
  id: string;
  date: string;
  category: string;
  event?: string;
  eventType: EventType;
  paymentMethod?: PaymentMethod;
  value: number;
  description?: string;
  beerControl?: IBeerControl[];
}

export interface IFilters {
    startDate: string;
    endDate: string;
    category: string;
    event: string;
    eventType: string;
    paymentMethod: string;
}

export interface IEntriesPresentationProps {
    entries: IEntry[];
    filters: IFilters;
    onFilterChange: (field: keyof IFilters, value: string) => void;
    onClearFilters: () => void;
    onOpenModal: (entry?: IEntry) => void;
    onDeleteEntry: (id: string) => void;
    isModalOpen: boolean;
    onCloseModal: () => void;
    editingEntry: IEntry | null;
    formMethods: UseFormReturn<EntryFormSchema>;
    onSave: (data: EntryFormSchema) => void;
    isLoading: boolean;
    availableStockItems: IStockItem[];
}

export interface IEntryFormProps {
    formMethods: UseFormReturn<EntryFormSchema>;
    onSave: (data: EntryFormSchema) => void;
    onCancel: () => void;
    isLoading: boolean;
    availableStockItems: IStockItem[];
}