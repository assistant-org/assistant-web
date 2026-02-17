import React, { useState, useMemo, useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { outputFormSchema, OutputFormSchema } from "./schema";
import OutputsPresentation from "./presentation";
import {
  IOutputsPresentationProps,
  IOutput,
  IFilters,
  OutputType,
  PaymentMethod,
} from "./types";
import { outputsService } from "../../../shared/services/outputs/outputs.serivce";
import { useCategories } from "../../../shared/hooks/useCategories";
import { useToast } from "../../../shared/context/ToastContext";
import { eventsService } from "../../../shared/services/events/events.service";
import { CategoryType } from "../categories/types";

const initialFilters: IFilters = {
  startDate: "",
  endDate: "",
  category: "",
  paymentMethod: "",
};

export default function OutputsContainer() {
  const [outputs, setOutputs] = useState<IOutput[]>([]);
  const [filters, setFilters] = useState<IFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutput, setEditingOutput] = useState<IOutput | null>(null);
  const [viewingOutput, setViewingOutput] = useState<IOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const { categories, loading: categoriesLoading } = useCategories();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadOutputs();
    loadEvents();
  }, []);

  const loadOutputs = async () => {
    setIsLoading(true);
    setError(null);
    const result = await outputsService.findAll();
    if (result.error) {
      toastError(result.error);
    } else {
      setOutputs(result.data || []);
    }
    setIsLoading(false);
  };

  const loadEvents = async () => {
    const result = await eventsService.findAll();
    if (result.data) {
      setEvents(result.data);
    }
  };

  const formMethods = useForm<OutputFormSchema>({
    resolver: zodResolver(outputFormSchema) as Resolver<OutputFormSchema>,
  });

  useEffect(() => {
    if (editingOutput) {
      const categoryId =
        categories.find((c) => c.name === editingOutput.category)?.id ||
        editingOutput.category;
      formMethods.reset({
        ...editingOutput,
        category: categoryId,
        value: Number(editingOutput.value) || 0,
      });
    } else {
      formMethods.reset({
        date: new Date().toISOString().split("T")[0],
        value: undefined,
        category: "",
        paymentMethod: undefined,
        description: "",
        event: "",
      });
    }
  }, [editingOutput, isModalOpen, formMethods, categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === CategoryType.OUTPUT);
  }, [categories]);

  const handleFilterChange = (field: keyof IFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const filteredOutputs = useMemo(() => {
    return outputs.filter((output) => {
      const categoryMatch = filters.category
        ? output.category === filters.category
        : true;
      const paymentMethodMatch = filters.paymentMethod
        ? output.paymentMethod === filters.paymentMethod
        : true;
      const startDateMatch = filters.startDate
        ? output.date >= filters.startDate
        : true;
      const endDateMatch = filters.endDate
        ? output.date <= filters.endDate
        : true;

      return (
        categoryMatch && paymentMethodMatch && startDateMatch && endDateMatch
      );
    });
  }, [outputs, filters]);

  const handleOpenModal = (output?: IOutput) => {
    setEditingOutput(output || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOutput(null);
    setViewingOutput(null);
  };

  const handleViewDetails = (output: IOutput) => {
    setViewingOutput(output);
  };

  const handleSaveOutput = async (data: OutputFormSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      const outputData = { ...data };
      if (outputData.event === "" || outputData.event === "null") {
        outputData.event = null;
      }

      if (editingOutput) {
        const result = await outputsService.update(
          editingOutput.id,
          outputData,
        );
        if (result.error) {
          toastError(result.error);
        } else {
          await loadOutputs();
          handleCloseModal();
          success("Saída atualizada com sucesso!");
        }
      } else {
        const result = await outputsService.create({
          ...outputData,
          paymentMethod: outputData.paymentMethod || "",
        });
        if (result.error) {
          toastError(result.error);
        } else {
          await loadOutputs();
          handleCloseModal();
          success("Saída criada com sucesso!");
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro interno");
    }
    setIsLoading(false);
  };
  const handleDeleteOutput = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta saída?")) {
      setError(null);
      const result = await outputsService.delete(id);
      if (result.error) {
        toastError(result.error);
      } else {
        await loadOutputs();
        success("Saída excluída com sucesso!");
      }
    }
  };

  const presentationProps: IOutputsPresentationProps = {
    outputs: filteredOutputs,
    filters,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    onOpenModal: handleOpenModal,
    onDeleteOutput: handleDeleteOutput,
    onViewDetails: handleViewDetails,
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingOutput,
    viewingOutput,
    formMethods,
    onSave: handleSaveOutput,
    isLoading,
    categories: filteredCategories,
    events,
  };

  return <OutputsPresentation {...presentationProps} />;
}
