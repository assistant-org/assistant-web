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

const initialFilters: IFilters = {
  startDate: "",
  endDate: "",
  category: "",
  type: "",
  paymentMethod: "",
};

export default function OutputsContainer() {
  const [outputs, setOutputs] = useState<IOutput[]>([]);
  const [filters, setFilters] = useState<IFilters>(initialFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutput, setEditingOutput] = useState<IOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { categories, loading: categoriesLoading } = useCategories();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadOutputs();
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

  const formMethods = useForm<OutputFormSchema>({
    resolver: zodResolver(outputFormSchema),
  });

  useEffect(() => {
    if (editingOutput) {
      formMethods.reset({
        ...editingOutput,
        value: Number(editingOutput.value) || 0,
        recurrenceDay: Number(editingOutput.recurrenceDay) || undefined,
      });
    } else {
      formMethods.reset({
        date: new Date().toISOString().split("T")[0],
        value: undefined,
        category: "",
        type: OutputType.VARIABLE,
        paymentMethod: undefined,
        description: "",
        event: "",
        isRecurring: false,
        recurrenceDay: undefined,
      });
    }
  }, [editingOutput, isModalOpen, formMethods]);

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
      const typeMatch = filters.type ? output.type === filters.type : true;
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
        categoryMatch &&
        typeMatch &&
        paymentMethodMatch &&
        startDateMatch &&
        endDateMatch
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
  };

  const handleSaveOutput = async (data: OutputFormSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      // Definir type baseado em isRecurring, mas comentado por enquanto
      // const type = data.isRecurring ? OutputType.FIXED : OutputType.VARIABLE;
      // const type = OutputType.VARIABLE; // Temporário

      const outputData = { ...data };

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
        const result = await outputsService.create(outputData);
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
    isModalOpen,
    onCloseModal: handleCloseModal,
    editingOutput,
    formMethods,
    onSave: handleSaveOutput,
    isLoading,
    categories,
  };

  return <OutputsPresentation {...presentationProps} />;
}
