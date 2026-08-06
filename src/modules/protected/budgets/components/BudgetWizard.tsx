import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import Button from "../../../../shared/components/Button";
import DiscardConfirmDialog from "../../../../shared/components/DiscardConfirmDialog";
import { useMediaQuery } from "../../../../shared/hooks/useMediaQuery";
import { beerDistribution } from "../../../../shared/services/budgets/BeerDistributionService";
import { BudgetFormValues } from "../../../../shared/services/budgets/schema";
import {
  BudgetCalculationResult,
  BudgetServiceType,
  ConsumptionProfileId,
} from "../../../../shared/services/budgets/types";
import { Product } from "../../../../shared/services/products/types";
import BudgetPreview from "./BudgetPreview";
import StepClient from "./StepClient";
import StepConsumption from "./StepConsumption";
import StepDistance from "./StepDistance";
import StepDuration from "./StepDuration";
import StepExtras from "./StepExtras";
import StepFlavorDistribution from "./StepFlavorDistribution";
import StepFlavors from "./StepFlavors";
import StepOtherDrinks from "./StepOtherDrinks";
import StepPeople from "./StepPeople";
import StepReview from "./StepReview";
import StepServiceType from "./StepServiceType";
import { BudgetStepKey, getBudgetSteps } from "./steps";
import WizardProgress from "./WizardProgress";

interface BudgetWizardProps {
  formMethods: UseFormReturn<BudgetFormValues>;
  products: Product[];
  calculation: BudgetCalculationResult | null;
  isLoading: boolean;
  isEditing?: boolean;
  onCancel: () => void;
  onFinalize: () => void;
}

export default function BudgetWizard({
  formMethods,
  products,
  calculation,
  isLoading,
  isEditing = false,
  onCancel,
  onFinalize,
}: BudgetWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const [didInitEdit, setDidInitEdit] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobileShell = useMediaQuery("(max-width: 1023px)");

  const { watch, setValue, trigger, formState } = formMethods;
  const values = watch();

  const steps = useMemo(
    () => getBudgetSteps(values.flavors || []),
    [values.flavors],
  );

  // Open on review when editing
  useEffect(() => {
    if (!isEditing || didInitEdit || steps.length === 0) return;
    const reviewIdx = steps.findIndex((s) => s.key === "review");
    setStepIndex(reviewIdx >= 0 ? reviewIdx : 0);
    setDidInitEdit(true);
  }, [isEditing, didInitEdit, steps]);

  useEffect(() => {
    if (stepIndex >= steps.length) {
      setStepIndex(Math.max(0, steps.length - 1));
    }
  }, [steps.length, stepIndex]);

  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const isReview = step?.key === "review";
  const isFlavorDistribution = step?.key === "flavorDistribution";

  const percentValidation = useMemo(
    () => beerDistribution.validatePercents(values.flavors || []),
    [values.flavors],
  );

  const nextDisabled =
    isLoading || (isFlavorDistribution && !percentValidation.ok);

  const flavorIdsKey = (values.flavors || [])
    .map((f) => f.productId)
    .sort()
    .join("|");
  const prevFlavorIdsKey = React.useRef(flavorIdsKey);
  useEffect(() => {
    if (prevFlavorIdsKey.current === flavorIdsKey) return;
    prevFlavorIdsKey.current = flavorIdsKey;
    if (values.correctedLiters != null) {
      setValue("correctedLiters", null, { shouldDirty: true });
    }
  }, [flavorIdsKey, values.correctedLiters, setValue]);

  const previewProps = useMemo(
    () => ({
      result: calculation,
      serviceType: values.serviceType as BudgetServiceType,
      negotiatedTotal: values.negotiatedTotal,
      adjustmentReason: values.adjustmentReason,
      onNegotiatedChange: (v: number | null) =>
        setValue("negotiatedTotal", v, { shouldDirty: true }),
      onReasonChange: (v: string) =>
        setValue("adjustmentReason", v || null, { shouldDirty: true }),
      correctedLiters: values.correctedLiters ?? null,
      onCorrectedLitersChange: (v: number | null) =>
        setValue("correctedLiters", v, { shouldDirty: true }),
      disabled: isLoading,
    }),
    [
      calculation,
      values.serviceType,
      values.negotiatedTotal,
      values.adjustmentReason,
      values.correctedLiters,
      setValue,
      isLoading,
    ],
  );

  const goToStep = (key: BudgetStepKey) => {
    const idx = steps.findIndex((s) => s.key === key);
    if (idx >= 0) setStepIndex(idx);
  };

  const requestClose = () => {
    if (isLoading) return;
    setIsDiscardOpen(true);
  };

  const confirmDiscard = () => {
    setIsDiscardOpen(false);
    onCancel();
  };

  const handleNext = async () => {
    if (!step) return;
    if (isFlavorDistribution && !percentValidation.ok) return;

    if (step.key === "flavors" && values.flavors.length === 1) {
      setValue(
        "flavors",
        values.flavors.map((f) => ({ ...f, percent: 100 })),
        { shouldValidate: true },
      );
    }

    const valid =
      step.fields.length === 0
        ? true
        : step.key === "flavors"
          ? (values.flavors?.length ?? 0) > 0
          : await trigger(step.fields);
    if (!valid) {
      if (step.key === "flavors") {
        await trigger("flavors");
      }
      return;
    }
    if (isLast) {
      onFinalize();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const closeButton = (
    <button
      type="button"
      onClick={requestClose}
      disabled={isLoading}
      className="rounded-md p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      aria-label="Fechar"
    >
      <X className="h-6 w-6" />
    </button>
  );

  const discardDialog = (
    <DiscardConfirmDialog
      isOpen={isDiscardOpen}
      onCancel={() => setIsDiscardOpen(false)}
      onConfirm={confirmDiscard}
      title={isEditing ? "Cancelar edição?" : "Cancelar orçamento?"}
      message={
        isEditing
          ? "Deseja sair sem salvar as alterações?"
          : "Deseja realmente cancelar este orçamento? Todas as informações preenchidas serão perdidas."
      }
    />
  );

  const renderStep = () => {
    if (!step) return null;
    switch (step.key) {
      case "serviceType":
        return (
          <StepServiceType
            value={values.serviceType as BudgetServiceType}
            onChange={(v) =>
              setValue("serviceType", v, { shouldValidate: true })
            }
            disabled={isLoading}
          />
        );
      case "people":
        return (
          <StepPeople
            value={values.people}
            onChange={(v) => setValue("people", v, { shouldValidate: true })}
            disabled={isLoading}
          />
        );
      case "duration":
        return (
          <StepDuration
            value={values.hours}
            onChange={(v) => setValue("hours", v, { shouldValidate: true })}
            disabled={isLoading}
          />
        );
      case "consumption":
        return (
          <StepConsumption
            value={values.consumptionProfile as ConsumptionProfileId}
            onChange={(v) =>
              setValue("consumptionProfile", v, { shouldValidate: true })
            }
            disabled={isLoading}
          />
        );
      case "otherDrinks":
        return (
          <StepOtherDrinks
            value={values.otherDrinks}
            onChange={(v) =>
              setValue("otherDrinks", v, { shouldValidate: true })
            }
            disabled={isLoading}
          />
        );
      case "flavors":
        return (
          <StepFlavors
            products={products}
            value={values.flavors}
            onChange={(v) => setValue("flavors", v, { shouldValidate: true })}
            disabled={isLoading}
            error={
              formState.errors.flavors?.message ||
              (formState.errors.flavors as { root?: { message?: string } })
                ?.root?.message
            }
          />
        );
      case "flavorDistribution":
        return (
          <StepFlavorDistribution
            value={values.flavors}
            onChange={(v) => setValue("flavors", v, { shouldValidate: true })}
            disabled={isLoading}
          />
        );
      case "distance":
        return (
          <StepDistance
            value={values.distanceKm}
            serviceType={values.serviceType as BudgetServiceType}
            onChange={(v) =>
              setValue("distanceKm", v, { shouldValidate: true })
            }
            disabled={isLoading}
          />
        );
      case "extras":
        return (
          <StepExtras
            value={values.extras}
            onChange={(v) => setValue("extras", v)}
            disabled={isLoading}
          />
        );
      case "client":
        return <StepClient formMethods={formMethods} disabled={isLoading} />;
      case "review":
        return (
          <StepReview
            values={values}
            steps={steps}
            onEditStep={goToStep}
            isEditing={isEditing}
            {...previewProps}
          />
        );
      default:
        return null;
    }
  };

  const onPrimaryClick = async () => {
    if (isReview && !isLast) {
      // Should not happen after reorder; still save if review
      const valid = await trigger();
      if (valid) onFinalize();
      return;
    }
    await handleNext();
  };

  // When editing a section (not on review), "Revisar" returns to review
  const showReviewReturn = isEditing && !isReview;
  const footer = (
    <div className="flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={
          showReviewReturn
            ? () => goToStep("review")
            : handleBack
        }
        disabled={(!showReviewReturn && isFirst) || isLoading}
      >
        {showReviewReturn ? "Revisar" : "Voltar"}
      </Button>
      <Button
        type="button"
        onClick={onPrimaryClick}
        isLoading={isLoading && (isLast || isReview)}
        disabled={nextDisabled}
      >
        {isReview || isLast ? "Salvar" : "Próximo"}
      </Button>
    </div>
  );

  const progress = (
    <WizardProgress
      currentIndex={stepIndex}
      total={steps.length}
      title={step?.title ?? ""}
    />
  );

  const title = isEditing ? "Editar orçamento" : "Novo orçamento";
  const subtitle = isEditing
    ? "Altere as seções necessárias e salve"
    : "Configure a proposta em poucos passos";

  if (isMobileShell) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900 flex flex-col">
          <div
            className="flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 shrink-0"
            style={{
              paddingTop: "max(env(safe-area-inset-top), 1rem)",
              paddingBottom: "0.75rem",
            }}
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
            {closeButton}
          </div>

          <div className="px-4 pt-3 shrink-0">{progress}</div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="min-h-full flex flex-col justify-center items-stretch">
              {renderStep()}
            </div>
          </div>

          <div
            className="border-t border-gray-200 dark:border-gray-700 px-4 shrink-0"
            style={{
              paddingTop: "0.75rem",
              paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
            }}
          >
            {footer}
          </div>
        </div>
        {discardDialog}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          {closeButton}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col min-h-[70vh]">
            {progress}
            <div className="flex-1 overflow-y-auto py-5 flex flex-col justify-center">
              {renderStep()}
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {footer}
            </div>
          </div>

          {isDesktop && !isReview ? (
            <div className="lg:sticky lg:top-4 self-start">
              <BudgetPreview {...previewProps} />
            </div>
          ) : isDesktop && isReview ? (
            <div className="lg:sticky lg:top-4 self-start rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-sm text-gray-500 text-center">
              Use os lápis à esquerda para editar seções. Ajuste litros e valor
              da proposta na memória de cálculo.
            </div>
          ) : null}
        </div>
      </div>
      {discardDialog}
    </>
  );
}
