import { UseFormReturn } from "react-hook-form";
import { EventFormSchema } from "./schema";
import { PageSize } from "../../../shared/hooks/usePagination";

export enum EventType {
  CLOSED = "CLOSED_EVENTS",
  SINGLE = "OPEN_EVENTS",
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.CLOSED]: "Evento Fechado",
  [EventType.SINGLE]: "Evento Avulso",
};

export interface IEvent {
  id: string;
  name: string;
  date: string;
  type: EventType;
  observations?: string;
  totalRevenue?: number;
}

export interface IEventsPresentationProps {
  events: IEvent[];
  onOpenModal: (event?: IEvent) => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  editingEvent: IEvent | null;
  formMethods: UseFormReturn<EventFormSchema>;
  onSave: (data: EventFormSchema) => void;
  isLoading: boolean;
  page: number;
  pageSize: PageSize;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

export interface IEventFormProps {
  formMethods: UseFormReturn<EventFormSchema>;
  onSave: (data: EventFormSchema) => void;
  onCancel: () => void;
  isLoading: boolean;
}
