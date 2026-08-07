import React, { useEffect, useMemo, useState } from "react";
import Button from "../../../../../shared/components/Button";
import FormShell from "../../../../../shared/components/FormShell";
import { TransactionType } from "../../../../../shared/services/transactions/types";
import { ITransactionWizardProps } from "../../types";
import { getStepsForType, StepKey } from "./steps";
import WizardProgress from "./WizardProgress";
import StepTypeSelect from "./StepTypeSelect";
import StepIncomeExpenseDetails from "./StepIncomeExpenseDetails";
import StepIncomeExpenseExtras from "./StepIncomeExpenseExtras";
import StepReview from "./StepReview";

export default function TransactionWizard({
  isOpen,
  onClose,
  isEditing,
  formMethods,
  onSave,
  onDelete,
  isLoading,
  categories,
  accounts,
  events,
  eventsEnabled,
}: ITransactionWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const { watch, setValue, trigger, handleSubmit, getValues } = formMethods;

  const type = watch("type");
  const sourceAccountId = watch("sourceAccountId");
  const destinationAccountId = watch("destinationAccountId");

  const activeAccounts = useMemo(() => accounts.filter((a) => a.active), [accounts]);
  const defaultAccountId = activeAccounts[0]?.id;

  useEffect(() => {
    if (!isOpen) return;
    if (isEditing) {
      const editSteps = getStepsForType(getValues("type"));
      const reviewIdx = editSteps.findIndex((s) => s.key === "review");
      setCurrentStepIndex(reviewIdx >= 0 ? reviewIdx : 0);
    } else {
      setCurrentStepIndex(0);
    }
  }, [isOpen, isEditing, getValues]);

  useEffect(() => {
    if (!isOpen || !defaultAccountId) return;
    if (type === TransactionType.INCOME && !destinationAccountId) {
      setValue("destinationAccountId", defaultAccountId);
    }
    if (type === TransactionType.EXPENSE && !sourceAccountId) {
      setValue("sourceAccountId", defaultAccountId);
    }
  }, [
    isOpen,
    type,
    defaultAccountId,
    destinationAccountId,
    sourceAccountId,
    setValue,
  ]);

  if (!isOpen) return null;

  const steps = getStepsForType(type);
  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];
  const isFirstStep = currentStepIndex === 0;
  const isReviewStep = currentStep.key === "review";

  const handleTypeChange = (newType: TransactionType) => {
    setValue("type", newType);
    setValue("categoryId", "");
    if (newType === TransactionType.INCOME) {
      setValue("sourceAccountId", null);
    } else {
      setValue("destinationAccountId", null);
    }
  };

  const handleNext = async () => {
    const fields = currentStep.fields;
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) {
      setCurrentStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }
  };

  const handleBack = () => setCurrentStepIndex((i) => Math.max(i - 1, 0));

  const goToStep = (key: StepKey) => {
    const idx = steps.findIndex((s) => s.key === key);
    if (idx >= 0) setCurrentStepIndex(idx);
  };

  const resolveCategoryName = (id?: string | null) => {
    if (!id) return "-";
    return categories.find((c) => String(c.id) === String(id))?.name || "—";
  };
  const resolveEventName = (id?: string | null) => {
    if (!id) return null;
    return events.find((e) => e.id === id)?.name || id;
  };

  const renderStepBody = () => {
    switch (currentStep.key) {
      case "type":
        return <StepTypeSelect value={type} onChange={handleTypeChange} disabled={isLoading} />;
      case "incomeExpenseDetails":
        return (
          <StepIncomeExpenseDetails
            formMethods={formMethods}
            type={type}
            categories={categories}
            isLoading={isLoading}
          />
        );
      case "incomeExpenseExtras":
        return (
          <StepIncomeExpenseExtras
            formMethods={formMethods}
            isLoading={isLoading}
            events={events}
            eventsEnabled={eventsEnabled}
          />
        );
      case "review":
        return (
          <StepReview
            values={getValues()}
            type={type}
            steps={steps.filter((s) => s.key !== "review")}
            eventsEnabled={eventsEnabled}
            onEditStep={goToStep}
            resolveCategoryName={resolveCategoryName}
            resolveEventName={resolveEventName}
          />
        );
      default:
        return null;
    }
  };

  const nextLabel = steps[currentStepIndex + 1]?.key === "review" ? "Revisar" : "Próximo";
  const title = isEditing ? "Editar Movimentação" : "Nova Movimentação";

  return (
    <FormShell
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      requireConfirmClose
      footer={({ requestClose }) =>
        isReviewStep ? (
          <div className={`flex gap-3 ${isEditing && onDelete ? "justify-between" : "justify-end"}`}>
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="secondary"
                onClick={onDelete}
                disabled={isLoading}
                className="!text-red-600 !border-red-300 hover:!bg-red-50 dark:hover:!bg-red-950/30"
              >
                Excluir
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button type="button" variant="secondary" onClick={requestClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="button" isLoading={isLoading} onClick={() => handleSubmit(onSave)()}>
                Salvar
              </Button>
            </div>
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
        )
      }
    >
      <WizardProgress currentIndex={currentStepIndex} total={steps.length} />
      <div className="mt-4">{renderStepBody()}</div>
    </FormShell>
  );
}
