import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import Button from "../../../../../shared/components/Button";
import FormShell from "../../../../../shared/components/FormShell";
import { Product } from "../../../../../shared/services/products/types";
import {
  StockBatch,
  StockMovementType,
} from "../../../../../shared/services/stock/types";
import { StockFormValues } from "../../schema";
import {
  movementRequiresEvent,
  movementRequiresJustification,
} from "../../../../../shared/services/stock/schema";
import StepTypeCards from "./StepTypeCards";
import StepOperation from "./StepOperation";
import StepEntryMeta from "./StepEntryMeta";
import StepOutgoingMeta from "./StepOutgoingMeta";
import StepReview from "./StepReview";
import { getStockStepsForType, StockStepKey } from "./steps";

interface IEventOption {
  id: string;
  name: string;
}

interface StockMovementWizardProps {
  isOpen: boolean;
  onClose: () => void;
  formMethods: UseFormReturn<StockFormValues>;
  onSave: (data: StockFormValues) => void;
  isLoading: boolean;
  products: Product[];
  batches: StockBatch[];
  events: IEventOption[];
}

export default function StockMovementWizard({
  isOpen,
  onClose,
  formMethods,
  onSave,
  isLoading,
  products,
  batches,
  events,
}: StockMovementWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { watch, setValue, trigger, handleSubmit, getValues, setError } = formMethods;
  const type = watch("type");

  useEffect(() => {
    if (isOpen) setCurrentStepIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = getStockStepsForType(type);
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isReviewStep = currentStep.key === "review";

  const handleTypeChange = (newType: StockMovementType) => {
    setValue("type", newType);
    setValue("eventId", null);
    setValue("mode", "individual");
    setValue("items", [
      {
        productId: "",
        batchId: null,
        quantity: undefined as unknown as number,
        unitValue: newType === StockMovementType.ENTRY ? 0 : null,
        availableQuantity: null,
      },
    ]);
  };

  const handleNext = async () => {
    const fields = currentStep.fields;
    let valid = fields.length === 0 ? true : await trigger(fields as any);

    if (valid && currentStep.key === "operation" && movementRequiresEvent(type)) {
      const eventId = getValues("eventId");
      if (!eventId) {
        setError("eventId", { type: "manual", message: "Evento é obrigatório" });
        valid = false;
      }
    }

    if (valid && currentStep.key === "meta" && movementRequiresJustification(type)) {
      const reason = getValues("reason")?.trim() ?? "";
      if (!reason) {
        setError("reason", { type: "manual", message: "Justificativa é obrigatória" });
        valid = false;
      }
    }

    if (valid) setCurrentStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const handleBack = () => setCurrentStepIndex((i) => Math.max(i - 1, 0));

  const goToStep = (key: StockStepKey) => {
    const idx = steps.findIndex((s) => s.key === key);
    if (idx >= 0) setCurrentStepIndex(idx);
  };

  const resolveProductName = (id?: string | null) =>
    products.find((p) => p.id === id)?.name || id || "-";

  const resolveBatchLabel = (id?: string | null) => {
    if (!id) return "-";
    const batch = batches.find((b) => b.id === id);
    if (!batch) return id;
    return `Lote #${batch.id} · ${batch.availableQuantity.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
    })} L`;
  };

  const resolveEventName = (id?: string | null) =>
    events.find((e) => e.id === id)?.name || id || "-";

  const renderBody = () => {
    switch (currentStep.key) {
      case "type":
        return <StepTypeCards value={type} onChange={handleTypeChange} disabled={isLoading} />;
      case "operation":
        return (
          <StepOperation
            formMethods={formMethods}
            products={products}
            batches={batches}
            events={events}
            isLoading={isLoading}
          />
        );
      case "meta":
        return type === StockMovementType.ENTRY ? (
          <StepEntryMeta formMethods={formMethods} isLoading={isLoading} />
        ) : (
          <StepOutgoingMeta
            formMethods={formMethods}
            type={type}
            isLoading={isLoading}
          />
        );
      case "review":
        return (
          <StepReview
            values={getValues()}
            type={type}
            steps={steps.filter((s) => s.key !== "review")}
            onEditStep={goToStep}
            resolveProductName={resolveProductName}
            resolveBatchLabel={resolveBatchLabel}
            resolveEventName={resolveEventName}
          />
        );
      default:
        return null;
    }
  };

  const nextLabel = steps[currentStepIndex + 1]?.key === "review" ? "Revisar" : "Próximo";

  const footer = isReviewStep ? (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button type="button" isLoading={isLoading} onClick={() => handleSubmit(onSave)()}>
        Salvar
      </Button>
    </div>
  ) : (
    <div className="flex justify-between gap-3">
      {!isFirstStep ? (
        <Button type="button" variant="secondary" onClick={handleBack} disabled={isLoading}>
          Voltar
        </Button>
      ) : (
        <span />
      )}
      <Button type="button" onClick={handleNext} disabled={isLoading}>
        {nextLabel}
      </Button>
    </div>
  );

  return (
    <FormShell
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Movimentação"
      requireConfirmClose
      footer={footer}
    >
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
        Passo {currentStepIndex + 1} de {steps.length}
      </p>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{
            width: `${steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 100}%`,
          }}
        />
      </div>
      {renderBody()}
    </FormShell>
  );
}
