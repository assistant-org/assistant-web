import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EventsPresentation from './presentation';
import { eventFormSchema, EventFormSchema } from './schema';
import { IEventsPresentationProps, IEvent, EventType } from './types';
import { IEntry, EventType as EntryEventType, PaymentMethod } from '../entries/types';

// Mock data for events
const mockEventsData: Omit<IEvent, 'totalRevenue'>[] = [
    { id: 'evt1', name: 'Festa Junina Local', date: '2024-07-20', type: EventType.SINGLE, observations: 'Evento aberto ao público.' },
    { id: 'evt2', name: 'Casamento S&J', date: '2024-07-18', type: EventType.CLOSED },
    { id: 'evt3', name: 'Aniversário Sr. Carlos', date: '2024-07-15', type: EventType.CLOSED, observations: 'Festa privada.' },
];

// Mock entry data to calculate revenue
const mockEntriesData: IEntry[] = [
    { id: '1', date: '2024-07-20', category: 'Venda de Chopp', event: 'Festa Junina Local', eventType: EntryEventType.SINGLE, value: 1500 },
    { id: '5', date: '2024-07-20', category: 'Serviço de Bar', event: 'Festa Junina Local', eventType: EntryEventType.SINGLE, value: 450 },
    { id: '2', date: '2024-07-18', category: 'Serviço de Bar', event: 'Casamento S&J', eventType: EntryEventType.CLOSED, paymentMethod: PaymentMethod.PIX, value: 3500 },
    { id: '3', date: '2024-07-15', category: 'Venda de Chopp', event: 'Aniversário Sr. Carlos', eventType: EntryEventType.CLOSED, paymentMethod: PaymentMethod.CARD, value: 2200 },
];

export default function EventsContainer() {
    const [events, setEvents] = useState<Omit<IEvent, 'totalRevenue'>[]>(mockEventsData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
        return events.map(event => {
            const relatedEntries = mockEntriesData.filter(entry => entry.event === event.name);
            const totalRevenue = relatedEntries.reduce((sum, entry) => sum + entry.value, 0);
            return { ...event, totalRevenue };
        });
    }, [events]);

    const handleOpenModal = (event?: IEvent) => {
        setEditingEvent(event || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleSaveEvent = (data: EventFormSchema) => {
        setIsLoading(true);
        setTimeout(() => {
            if (editingEvent) {
                setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...data, id: editingEvent.id } : e));
            } else {
                const newEvent: IEvent = { ...data, id: String(Date.now()) };
                setEvents(prev => [newEvent, ...prev]);
            }
            setIsLoading(false);
            handleCloseModal();
        }, 1000);
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
