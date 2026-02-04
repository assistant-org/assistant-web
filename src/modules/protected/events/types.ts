import { UseFormReturn } from 'react-hook-form';
import { EventFormSchema } from './schema';

export enum EventType {
  CLOSED = 'fechado',
  SINGLE = 'avulso',
}

export interface IEvent {
  id: string;
  name: string;
  date: string;
  type: EventType;
  observations?: string;
  totalRevenue?: number; // Calculated field
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
}

export interface IEventFormProps {
    formMethods: UseFormReturn<EventFormSchema>;
    onSave: (data: EventFormSchema) => void;
    onCancel: () => void;
    isLoading: boolean;
}
