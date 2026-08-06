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
import { getBudgetSteps } from "./steps";
import WizardProgress from "./WizardProgress";

interface BudgetWizardProps {
  formMethods: UseFormReturn<BudgetFormValues>;
  products: Product[];
  calculation: BudgetCalculationResult | null;
  isLoading: boolean;
  onCancel: () => void;
  onFinalize: () => void;
}

export default function BudgetWizard({
  formMethods,
  products,
  calculation,
  isLoading,
  onCancel,
  onFinalize,
}: BudgetWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobileShell = useMediaQuery("(max-width: 1023px)");

  const { watch, setValue, trigger, formState } = formMethods;
  const values = watch();

  const steps = useMemo(
    () => getBudgetSteps(values.flavors || []),
    [values.flavors],
  );

  // Keep index valid when steps list shrinks (e.g. remove multi-flavor step)
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

  // Drop liter correction when selected flavors change (not on mount)
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

    // On flavors step with a single flavor, force 100%
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
          ? // Only require at least one flavor here; % validated on distribution or finalize
            (values.flavors?.length ?? 0) > 0
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

  const handleBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const nextLabel = isLast
    ? "Finalizar"
    : isReview
      ? "Continuar para cliente"
      : "Próximo";

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
      title="Cancelar orçamento?"
      message="Deseja realmente cancelar este orçamento? Todas as informações preenchidas serão perdidas."
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
      case "review":
        return <StepReview {...previewProps} />;
      case "client":
        return <StepClient formMethods={formMethods} disabled={isLoading} />;
      default:
        return null;
    }
  };

  const footer = (
    <div className="flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleBack}
        disabled={isFirst || isLoading}
      >
        Voltar
      </Button>
      <Button
        type="button"
        onClick={handleNext}
        isLoading={isLoading && isLast}
        disabled={nextDisabled}
      >
        {nextLabel}
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
                Novo orçamento
              </h2>
              <p className="text-xs text-gray-500">Configure a proposta</p>
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
              Novo orçamento
            </h2>
            <p className="text-sm text-gray-500">
              Configure a proposta em poucos passos
            </p>
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
              Revise o cálculo no painel à esquerda antes de seguir para o
              cliente.
            </div>
          ) : null}
        </div>
      </div>
      {discardDialog}
    </>
  );
}
