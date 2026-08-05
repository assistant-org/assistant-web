import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EventsPresentation from "./presentation";
import { eventFormSchema, EventFormSchema } from "./schema";
import { IEventsPresentationProps, IEvent } from "./types";
import { eventsService } from "../../../shared/services/events/events.service";
import { useToast } from "../../../shared/context/ToastContext";
import { useServerList } from "../../../shared/hooks/useServerList";
import { PaginatedResult } from "../../../shared/services/types";
import { todayISODate } from "../../../shared/utils/formatDate";

type EventListFilters = Record<string, never>;

export default function EventsContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchEvents = useCallback(
    async (params: EventListFilters & { page: number; pageSize: number }) => {
      const result = await eventsService.findPage({
        page: params.page,
        pageSize: params.pageSize,
      });
      if (result.error || !result.data) {
        return { data: null, error: result.error };
      }
      const items = (result.data.items as IEvent[]).map((event) => ({
        ...event,
        totalRevenue: event.totalRevenue ?? 0,
      }));
      return {
        data: {
          ...result.data,
          items,
        } as PaginatedResult<IEvent>,
        error: null,
      };
    },
    [],
  );

  const list = useServerList(fetchEvents, {
    initialFilters: {},
    initialPageSize: 10,
  });

  useEffect(() => {
    if (list.error) toastError(list.error);
  }, [list.error, toastError]);

  const formMethods = useForm<EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
  });

  useEffect(() => {
    if (editingEvent) {
      formMethods.reset(editingEvent);
    } else {
      formMethods.reset({
        name: "",
        date: todayISODate(),
        type: undefined,
        observations: "",
      });
    }
  }, [editingEvent, isModalOpen, formMethods]);

  const handleOpenModal = (event?: IEvent) => {
    setEditingEvent(event || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async (data: EventFormSchema) => {
    setIsSaving(true);
    try {
      if (editingEvent) {
        const result = await eventsService.update(editingEvent.id, data);
        if (result.error) {
          toastError(result.error);
        } else {
          list.reload();
          handleCloseModal();
          success("Evento atualizado com sucesso!");
        }
      } else {
        const result = await eventsService.create(data);
        if (result.error) {
          toastError(result.error);
        } else {
          list.reload();
          handleCloseModal();
          success("Evento criado com sucesso!");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro interno";
      toastError(message);
    }
    setIsSaving(false);
  };

  const presentationProps: IEventsPresentationProps = {
    events: list.items,
    onOpenModal: handleOpenModal,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingEvent,
    formMethods,
    onSave: handleSaveEvent,
    isLoading: list.loading || isSaving,
    page: list.page,
    pageSize: list.pageSize,
    totalItems: list.total,
    totalPages: list.totalPages,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  };

  return <EventsPresentation {...presentationProps} />;
}
