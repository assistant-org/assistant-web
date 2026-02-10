import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EventsPresentation from './presentation';
import { eventFormSchema, EventFormSchema } from './schema';
import { IEventsPresentationProps, IEvent, EventType } from './types';
import { eventsService } from '../../../shared/services/events/events.service';
import { useToast } from '../../../shared/context/ToastContext';

export default function EventsContainer() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { success, error: toastError } = useToast();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setIsLoading(true);
        setError(null);
        const result = await eventsService.findAll();
        if (result.error) {
            setError(result.error);
            toastError(result.error);
        } else {
            setEvents(result.data || []);
        }
        setIsLoading(false);
    };

    const formMethods = useForm<EventFormSchema>({
        resolver: zodResolver(eventFormSchema),
    });

     useEffect(() => {
        if (editingEvent) {
            formMethods.reset(editingEvent);
        } else {
            formMethods.reset({
                name: '',
                date: new Date().toISOString().split('T')[0],
                type: undefined,
                observations: '',
            });
        }
    }, [editingEvent, isModalOpen, formMethods]);

    const eventsWithRevenue = useMemo((): IEvent[] => {
        // TODO: Calcular revenue baseado em entries relacionadas
        return events.map(event => ({ ...event, totalRevenue: 0 }));
    }, [events]);

    const handleOpenModal = (event?: IEvent) => {
        setEditingEvent(event || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleSaveEvent = async (data: EventFormSchema) => {
        setIsLoading(true);
        setError(null);
        try {
            if (editingEvent) {
                const result = await eventsService.update(editingEvent.id, data);
                if (result.error) {
                    setError(result.error);
                    toastError(result.error);
                } else {
                    await loadEvents();
                    handleCloseModal();
                    success('Evento atualizado com sucesso!');
                }
            } else {
                const result = await eventsService.create(data);
                if (result.error) {
                    setError(result.error);
                    toastError(result.error);
                } else {
                    await loadEvents();
                    handleCloseModal();
                    success('Evento criado com sucesso!');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Erro interno');
            toastError(err.message || 'Erro interno');
        }
        setIsLoading(false);
    };

    const presentationProps: IEventsPresentationProps = {
        events: eventsWithRevenue,
        onOpenModal: handleOpenModal,
        isModalOpen,
        onCloseModal: handleCloseModal,
        editingEvent,
        formMethods,
        onSave: handleSaveEvent,
        isLoading,
    };

    return <EventsPresentation {...presentationProps} />;
}
