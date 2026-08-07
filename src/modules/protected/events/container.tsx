import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EventsPresentation from "./presentation";
import { eventFormSchema, EventFormSchema } from "./schema";
import { IEventsPresentationProps, IEvent } from "./types";
import { eventsService } from "../../../shared/services/events/events.service";
import { transactionsService } from "../../../shared/services/transactions/transactions.service";
import {
  TransactionStatus,
  TransactionType,
} from "../../../shared/services/transactions/types";
import { useToast } from "../../../shared/context/ToastContext";
import { useServerList } from "../../../shared/hooks/useServerList";
import { PaginatedResult } from "../../../shared/services/types";
import { todayISODate } from "../../../shared/utils/formatDate";

type EventListFilters = Record<string, never>;

export default function EventsContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<IEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

      const pageItems = result.data.items as IEvent[];
      const eventIds = pageItems
        .map((e) => e.id)
        .filter(Boolean)
        .map(String);

      const revenueByEvent: Record<string, number> = {};
      if (eventIds.length > 0) {
        const txResult = await transactionsService.findAll({
          type: TransactionType.INCOME,
          status: TransactionStatus.ACTIVE,
        });
        if (txResult.data) {
          const idSet = new Set(eventIds);
          for (const t of txResult.data) {
            if (!t.eventId) continue;
            const eid = String(t.eventId);
            if (!idSet.has(eid)) continue;
            revenueByEvent[eid] =
              (revenueByEvent[eid] || 0) + (Number(t.value) || 0);
          }
        }
      }

      const items = pageItems.map((event) => ({
        ...event,
        id: String(event.id),
        totalRevenue: revenueByEvent[String(event.id)] ?? 0,
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

  const handleOpenDelete = (event: IEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    const result = await eventsService.delete(eventToDelete.id);
    setIsDeleting(false);
    if (result.error) {
      toastError(result.error);
      return;
    }
    handleCloseDelete();
    list.reload();
    success("Evento excluído com sucesso!");
  };

  const presentationProps: IEventsPresentationProps = {
    events: list.items,
    onOpenModal: handleOpenModal,
    onDelete: handleOpenDelete,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingEvent,
    formMethods,
    onSave: handleSaveEvent,
    isLoading: isSaving,
    isListLoading: list.loading,
    isDeleteModalOpen,
    eventToDelete,
    onCloseDelete: handleCloseDelete,
    onConfirmDelete: handleConfirmDelete,
    isDeleting,
    page: list.page,
    pageSize: list.pageSize,
    totalItems: list.total,
    totalPages: list.totalPages,
    onPageChange: list.setPage,
    onPageSizeChange: list.setPageSize,
  };

  return <EventsPresentation {...presentationProps} />;
}
