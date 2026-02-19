import React, { useState, useMemo, useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entryFormSchema, EntryFormSchema } from "./schema";
import EntriesPresentation from "./presentation";
import {
  IEntriesPresentationProps,
  IEntry,
  IFilters,
  EventType,
  PaymentMethod,
} from "./types";
import { mockStockItems } from "../stock/container";
import { IStockItem, StockStatus } from "../stock/types";
import { entriesService } from "../../../shared/services/entries/entries.service";
import { useCategories } from "../../../shared/hooks/useCategories";
import { useToast } from "../../../shared/context/ToastContext";
import { eventsService } from "../../../shared/services/events/events.service";
import { CategoryType } from "../categories/types";

// Mock data

const initialFilters: IFilters = {
  startDate: "",
  endDate: "",
  category: "",
  event: "",
  eventType: "",
  paymentMethod: "",
};

export default function EntriesContainer() {
  const [entries, setEntries] = useState<IEntry[]>([]);
  const [stockItems, setStockItems] = useState<IStockItem[]>(mockStockItems);
  const [filters, setFilters] = useState<IFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const { categories, loading: categoriesLoading } = useCategories();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadEntries();
    loadEvents();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    setError(null);
    const result = await entriesService.findAll();
    if (result.error) {
      toastError(result.error);
    } else {
      setEntries(result.data || []);
    }
    setIsLoading(false);
  };

  const loadEvents = async () => {
    const result = await eventsService.findAll();
    if (result.data) {
      setEvents(result.data);
    }
  };

  const formMethods = useForm<EntryFormSchema>({
    resolver: zodResolver(entryFormSchema) as Resolver<EntryFormSchema>,
  });

  useEffect(() => {
    if (editingEntry) {
      const categoryId =
        categories.find((c) => c.name === editingEntry.category)?.id ||
        editingEntry.category;
      formMethods.reset({
        ...editingEntry,
        category: categoryId,
        value: Number(editingEntry.value) || 0,
        beerControl:
          editingEntry.beerControl?.map((bc) => ({
            ...bc,
            quantityTaken: Number(bc.quantityTaken) || 0,
            quantityReturned: Number(bc.quantityReturned) || 0,
          })) || [],
      });
    } else {
      formMethods.reset({
        date: new Date().toISOString().split("T")[0],
        value: undefined,
        category: "",
        event: "",
        eventType: undefined,
        description: "",
        paymentMethod: undefined,
        beerControl: [],
      });
    }
  }, [editingEntry, isModalOpen, formMethods, categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === CategoryType.ENTRY);
  }, [categories]);

  const handleFilterChange = (field: keyof IFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const getEventName = (eventId: string | null | undefined) => {
    if (!eventId) return null;
    return events.find((e) => e.id === eventId)?.name || eventId;
  };

  const entriesWithEventNames = useMemo(() => {
    return entries.map((entry) => ({
      ...entry,
      eventName: getEventName(entry.event),
    }));
  }, [entries, events]);

  const filteredEntries = useMemo(() => {
    return entriesWithEventNames.filter((entry) => {
      const eventMatch = filters.event
        ? entry.eventName?.toLowerCase().includes(filters.event.toLowerCase())
        : true;
      const categoryMatch = filters.category
        ? entry.category === filters.category
        : true;
      const eventTypeMatch = filters.eventType
        ? entry.eventType === filters.eventType
        : true;
      const paymentMethodMatch = filters.paymentMethod
        ? entry.paymentMethod === filters.paymentMethod
        : true;
      const startDateMatch = filters.startDate
        ? entry.date >= filters.startDate
        : true;
      const endDateMatch = filters.endDate
        ? entry.date <= filters.endDate
        : true;

      return (
        eventMatch &&
        categoryMatch &&
        eventTypeMatch &&
        paymentMethodMatch &&
        startDateMatch &&
        endDateMatch
      );
    });
  }, [entriesWithEventNames, filters]);

  const availableStockItems = useMemo(() => {
    return stockItems.filter(
      (item) =>
        item.status === StockStatus.ACTIVE && item.availableQuantityLiters > 0,
    );
  }, [stockItems]);

  const handleOpenModal = (entry?: IEntry) => {
    setEditingEntry(entry || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = async (data: EntryFormSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      // Remove eventType from payload as it's not sent to backend
      const entryData: any = { ...data };
      delete entryData.eventType;
      delete entryData.beerControl;

      if (entryData.event === "" || entryData.event === "null") {
        entryData.event = null;
      }

      if (
        entryData.paymentMethod === "" ||
        entryData.paymentMethod === "null"
      ) {
        entryData.paymentMethod = null;
      }

      if (editingEntry) {
        const result = await entriesService.update(editingEntry.id, entryData);
        if (result.error) {
          toastError(result.error);
        } else {
          await loadEntries();
          handleCloseModal();
          success("Entrada atualizada com sucesso!");
        }
      } else {
        const result = await entriesService.create(entryData);
        if (result.error) {
          toastError(result.error);
        } else {
          await loadEntries();
          handleCloseModal();
          success("Entrada criada com sucesso!");
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro interno");
      toastError(err.message || "Erro interno");
    }
    setIsLoading(false);
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta entrada?")) {
      setError(null);
      const result = await entriesService.delete(id);
      if (result.error) {
        toastError(result.error);
      } else {
        await loadEntries();
        success("Entrada excluída com sucesso!");
      }
    }
  };

  const presentationProps: IEntriesPresentationProps = {
    entries: filteredEntries,
    filters,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    onOpenModal: handleOpenModal,
    onDeleteEntry: handleDeleteEntry,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingEntry,
    formMethods,
    onSave: handleSaveEntry,
    isLoading,
    availableStockItems,
    categories: filteredCategories,
    events,
    getEventName,
  };

  return <EntriesPresentation {...presentationProps} />;
}
