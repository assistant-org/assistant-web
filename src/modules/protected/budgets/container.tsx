import React, { useCallback, useEffect, useMemo, useState } from "react";
import ContractModal, {
  ContractModalValues,
} from "./components/ContractModal";
import BudgetDownloadModal, {
  openWhatsApp,
} from "./components/BudgetDownloadModal";
import BudgetGeneratedModal from "./components/BudgetGeneratedModal";
import ClientPhoneModal from "./components/ClientPhoneModal";
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
import {
  Budget,
  UpdateBudgetRequest,
} from "../../../shared/services/budgets/types";
import { productsService } from "../../../shared/services/products/products.service";
import { Product } from "../../../shared/services/products/types";
import { budgetToFormValues } from "./budgetToFormValues";
import BudgetsPresentation from "./presentation";

type Mode = "list" | "create" | "edit";

function budgetToUpdatePayload(
  budget: Budget,
  patch: Partial<Pick<Budget, "clientPhone" | "eventDate">>,
): UpdateBudgetRequest {
  return {
    serviceType: budget.serviceType,
    people: budget.people,
    hours: budget.hours,
    consumptionProfile: budget.consumptionProfile,
    otherDrinks: budget.otherDrinks,
    distanceKm: budget.distanceKm,
    flavors: budget.flavors?.length
      ? budget.flavors
      : budget.calculation.flavorLines,
    extras: budget.extras?.length
      ? budget.extras
      : budget.calculation.extraLines,
    calculation: budget.calculation,
    calculatedTotal: budget.calculatedTotal,
    finalTotal: budget.finalTotal,
    adjustmentReason: budget.adjustmentReason,
    clientName: budget.clientName,
    clientPhone: patch.clientPhone ?? budget.clientPhone,
    clientCity: budget.clientCity,
    notes: budget.notes,
    eventDate: patch.eventDate ?? budget.eventDate ?? "",
    status: budget.status,
  };
}

export default function BudgetsContainer() {
  const { success, error: toastError } = useToast();
  const [mode, setMode] = useState<Mode>("list");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [generatedBudget, setGeneratedBudget] = useState<Budget | null>(null);
  const [downloadBudget, setDownloadBudget] = useState<Budget | null>(null);
  const [contractBudget, setContractBudget] = useState<Budget | null>(null);
  const [phoneModalBudget, setPhoneModalBudget] = useState<Budget | null>(null);
  const [isSavingPhone, setIsSavingPhone] = useState(false);

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

  const replaceBudget = (updated: Budget) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b)),
    );
    setGeneratedBudget((prev) =>
      prev?.id === updated.id ? updated : prev,
    );
  };

  const handleNeedPhone = (budget: Budget) => {
    setDownloadBudget(null);
    setGeneratedBudget(null);
    setPhoneModalBudget(budget);
  };

  const handlePhoneConfirm = async (phone: string) => {
    if (!phoneModalBudget) return;
    setIsSavingPhone(true);
    const result = await budgetsService.update(
      phoneModalBudget.id,
      budgetToUpdatePayload(phoneModalBudget, { clientPhone: phone }),
    );
    setIsSavingPhone(false);

    if (result.error || !result.data) {
      toastError(result.error || "Erro ao salvar telefone");
      return;
    }

    replaceBudget(result.data);
    setPhoneModalBudget(null);
    openWhatsApp(result.data);
    success("Telefone salvo");
  };

  const handleStartCreate = () => {
    formMethods.reset(budgetFormDefaults());
    setEditingBudget(null);
    setMode("create");
  };

  const handleCancelWizard = () => {
    setEditingBudget(null);
    setMode("list");
  };

  const handleEdit = (budget: Budget) => {
    formMethods.reset(budgetToFormValues(budget));
    setEditingBudget(budget);
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
      clientCity: "",
      notes: data.notes || "",
      eventDate: data.eventDate || "",
      status: (editingBudget?.status ?? "open") as "open" | "concluded",
    };
  };

  const handleFinalize = async () => {
    const valid = await formMethods.trigger();
    if (!valid) {
      toastError("Preencha os campos obrigatórios.");
      return;
    }
    if (mode === "edit" && !formMethods.getValues("eventDate")?.trim()) {
      formMethods.setError("eventDate", {
        type: "required",
        message: "Data do evento obrigatória",
      });
      toastError("Informe a data do evento.");
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

    setBudgets((prev) => [result.data!, ...prev]);
    success("Orçamento salvo");
    setMode("list");
    setGeneratedBudget(result.data);
  };

  const handleConclude = async (budget: Budget) => {
    if (budget.status === "concluded") return;
    const confirmed = window.confirm(
      `Marcar orçamento de ${budget.clientName} como concluído?`,
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

  const handleReopen = async (budget: Budget) => {
    if (budget.status !== "concluded") return;
    const confirmed = window.confirm(
      `Marcar orçamento de ${budget.clientName} como não concluído?`,
    );
    if (!confirmed) return;

    const result = await budgetsService.updateStatus(budget.id, "open");
    if (result.error || !result.data) {
      toastError(result.error || "Erro ao reabrir orçamento");
      return;
    }
    setBudgets((prev) =>
      prev.map((b) => (b.id === budget.id ? result.data! : b)),
    );
    success("Orçamento reaberto");
  };

  const handleContractConfirm = async (values: ContractModalValues) => {
    if (!contractBudget) return;
    const budget = contractBudget;
    setContractBudget(null);

    try {
      if (values.eventDate && values.eventDate !== (budget.eventDate || "")) {
        const updated = await budgetsService.update(
          budget.id,
          budgetToUpdatePayload(budget, { eventDate: values.eventDate }),
        );
        if (updated.data) {
          replaceBudget(updated.data);
        }
      }

      const { downloadBudgetContractPdf } = await import(
        "../../../shared/services/budgets/contract/budgetContractPdf"
      );
      await downloadBudgetContractPdf({
        budget: {
          ...budget,
          eventDate: values.eventDate || budget.eventDate,
        },
        contractValues: values,
      });
      success("Contrato gerado");
    } catch (err) {
      console.error("Erro ao gerar contrato:", err);
      toastError("Falha ao gerar contrato.");
    }
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
    <>
      <BudgetsPresentation
        mode={mode}
        budgets={budgets}
        products={products}
        formMethods={formMethods}
        calculation={calculation}
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
        onEdit={handleEdit}
        onConclude={(b) => void handleConclude(b)}
        onReopen={(b) => void handleReopen(b)}
        onGenerateContract={setContractBudget}
        onDownload={setDownloadBudget}
        onDelete={handleDelete}
      />
      {generatedBudget ? (
        <BudgetGeneratedModal
          budget={generatedBudget}
          onClose={() => setGeneratedBudget(null)}
          onNeedPhone={handleNeedPhone}
        />
      ) : null}
      {downloadBudget ? (
        <BudgetDownloadModal
          budget={downloadBudget}
          onClose={() => setDownloadBudget(null)}
          onNeedPhone={handleNeedPhone}
        />
      ) : null}
      {contractBudget ? (
        <ContractModal
          clientName={contractBudget.clientName}
          initialEventDate={contractBudget.eventDate}
          onConfirm={(values) => void handleContractConfirm(values)}
          onCancel={() => setContractBudget(null)}
        />
      ) : null}
      {phoneModalBudget ? (
        <ClientPhoneModal
          clientName={phoneModalBudget.clientName}
          initialPhone={phoneModalBudget.clientPhone}
          isSaving={isSavingPhone}
          onConfirm={(phone) => void handlePhoneConfirm(phone)}
          onCancel={() => setPhoneModalBudget(null)}
        />
      ) : null}
    </>
  );
}
