import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../../../shared/context/ToastContext";
import { budgetCalculator } from "../../../shared/services/budgets/BudgetCalculatorService";
import { budgetsService } from "../../../shared/services/budgets/budgets.service";
import {
  budgetFormDefaults,
  budgetFormSchema,
  BudgetFormValues,
} from "../../../shared/services/budgets/schema";
import { Budget } from "../../../shared/services/budgets/types";
import { productsService } from "../../../shared/services/products/products.service";
import { Product } from "../../../shared/services/products/types";
import { budgetToFormValues } from "./budgetToFormValues";
import BudgetsPresentation from "./presentation";

type Mode = "list" | "create" | "edit" | "done";

export default function BudgetsContainer() {
  const { success, error: toastError } = useToast();
  const [mode, setMode] = useState<Mode>("list");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Budget | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const formMethods = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budgetFormDefaults(),
    mode: "onChange",
  });

  const watched = formMethods.watch();

  const calculation = useMemo(() => {
    try {
      if (!watched.serviceType || !watched.hours || !watched.people) {
        return null;
      }
      return budgetCalculator.calculate({
        serviceType: watched.serviceType,
        people: watched.people,
        hours: watched.hours,
        consumptionProfile: watched.consumptionProfile,
        otherDrinks: watched.otherDrinks,
        distanceKm: watched.distanceKm,
        flavors: watched.flavors || [],
        extras: watched.extras || [],
        correctedLiters: watched.correctedLiters ?? null,
        negotiatedTotal: watched.negotiatedTotal,
        adjustmentReason: watched.adjustmentReason,
      });
    } catch {
      return null;
    }
  }, [watched]);

  const loadList = useCallback(async () => {
    setIsLoading(true);
    const [budgetsRes, productsRes] = await Promise.all([
      budgetsService.findAll(),
      productsService.findAll(),
    ]);
    if (budgetsRes.error) toastError(budgetsRes.error);
    if (productsRes.error) toastError(productsRes.error);
    setBudgets(budgetsRes.data || []);
    setProducts(productsRes.data || []);
    setIsLoading(false);
  }, [toastError]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const handleStartCreate = () => {
    formMethods.reset(budgetFormDefaults());
    setEditingBudget(null);
    setLastSaved(null);
    setMode("create");
  };

  const handleCancelWizard = () => {
    setEditingBudget(null);
    setMode("list");
  };

  const handleEdit = (budget: Budget) => {
    formMethods.reset(budgetToFormValues(budget));
    setEditingBudget(budget);
    setLastSaved(null);
    setMode("edit");
  };

  const buildPayload = (data: BudgetFormValues) => {
    if (!calculation) return null;
    return {
      serviceType: data.serviceType,
      people: data.people,
      hours: data.hours,
      consumptionProfile: data.consumptionProfile,
      otherDrinks: data.otherDrinks,
      distanceKm: data.distanceKm,
      flavors: calculation.flavorLines,
      extras: calculation.extraLines,
      calculation,
      calculatedTotal: calculation.calculatedTotal,
      finalTotal: calculation.finalTotal,
      adjustmentReason: calculation.adjustmentReason,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientCity: data.clientCity,
      notes: data.notes || "",
      eventDate: data.eventDate,
      status: (editingBudget?.status ?? "open") as "open" | "concluded",
    };
  };

  const handleFinalize = async () => {
    const valid = await formMethods.trigger();
    if (!valid) {
      toastError("Preencha os campos obrigatórios (cliente, data e sabores).");
      return;
    }
    if (!calculation) {
      toastError("Não foi possível calcular o orçamento.");
      return;
    }

    const data = formMethods.getValues();
    const payload = buildPayload(data);
    if (!payload) return;

    setIsSaving(true);
    const result =
      mode === "edit" && editingBudget
        ? await budgetsService.update(editingBudget.id, payload)
        : await budgetsService.create(payload);
    setIsSaving(false);

    if (result.error || !result.data) {
      toastError(result.error || "Erro ao salvar orçamento");
      return;
    }

    if (mode === "edit") {
      setBudgets((prev) =>
        prev.map((b) => (b.id === result.data!.id ? result.data! : b)),
      );
      success("Orçamento atualizado");
      setEditingBudget(null);
      setMode("list");
      return;
    }

    setLastSaved(result.data);
    setBudgets((prev) => [result.data!, ...prev]);
    success("Orçamento salvo");
    setMode("done");
  };

  const handleConclude = async (budget: Budget) => {
    if (budget.status === "concluded") return;
    const confirmed = window.confirm(
      `Concluir orçamento de ${budget.clientName}?`,
    );
    if (!confirmed) return;
    const result = await budgetsService.updateStatus(budget.id, "concluded");
    if (result.error || !result.data) {
      toastError(result.error || "Erro ao concluir");
      return;
    }
    setBudgets((prev) =>
      prev.map((b) => (b.id === budget.id ? result.data! : b)),
    );
    success("Orçamento concluído");
  };

  const handleDelete = async (budget: Budget) => {
    const confirmed = window.confirm(
      `Excluir orçamento de ${budget.clientName}?`,
    );
    if (!confirmed) return;
    const result = await budgetsService.delete(budget.id);
    if (result.error) {
      toastError(result.error);
      return;
    }
    setBudgets((prev) => prev.filter((b) => b.id !== budget.id));
    success("Orçamento excluído");
  };

  return (
    <BudgetsPresentation
      mode={mode}
      budgets={budgets}
      products={products}
      formMethods={formMethods}
      calculation={calculation}
      lastSaved={lastSaved}
      isLoading={isLoading}
      isSaving={isSaving}
      isEditing={mode === "edit"}
      wizardKey={
        mode === "edit" && editingBudget
          ? `edit-${editingBudget.id}`
          : mode === "create"
            ? "create"
            : "list"
      }
      onStartCreate={handleStartCreate}
      onCancelWizard={handleCancelWizard}
      onFinalize={handleFinalize}
      onBackToList={() => setMode("list")}
      onEdit={handleEdit}
      onConclude={handleConclude}
      onDelete={handleDelete}
    />
  );
}
