import React, { useState } from "react";
import { Pencil } from "lucide-react";
import {
  getConsumptionProfile,
  getExtraDefinition,
  getServiceTypeConfig,
} from "../../../../shared/services/budgets/budget.config";
import { formatCurrency } from "../../../../shared/services/budgets/format";
import { BudgetFormValues } from "../../../../shared/services/budgets/schema";
import {
  BudgetCalculationResult,
  BudgetServiceType,
} from "../../../../shared/services/budgets/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";
import BudgetPreview from "./BudgetPreview";
import { BudgetStepDefinition, BudgetStepKey } from "./steps";

interface ReviewRow {
  label: string;
  value: string;
}

interface ReviewGroup {
  stepKey: BudgetStepKey;
  title: string;
  rows: ReviewRow[];
}

interface StepReviewProps {
  values: BudgetFormValues;
  steps: BudgetStepDefinition[];
  onEditStep: (key: BudgetStepKey) => void;
  /** Section pencils only in edit mode, and only after user opens the picker. */
  isEditing?: boolean;
  result: BudgetCalculationResult | null;
  serviceType: BudgetServiceType;
  negotiatedTotal: number | null | undefined;
  adjustmentReason: string | null | undefined;
  onNegotiatedChange: (value: number | null) => void;
  onReasonChange: (value: string) => void;
  correctedLiters?: number | null;
  onCorrectedLitersChange?: (value: number | null) => void;
  disabled?: boolean;
}

function buildGroups(
  values: BudgetFormValues,
  steps: BudgetStepDefinition[],
): ReviewGroup[] {
  return steps
    .map((step): ReviewGroup | null => {
      switch (step.key) {
        case "serviceType":
          return {
            stepKey: step.key,
            title: step.title,
            rows: [
              {
                label: "Tipo",
                value: getServiceTypeConfig(values.serviceType).label,
              },
            ],
          };
        case "people":
          return {
            stepKey: step.key,
            title: step.title,
            rows: [{ label: "Pessoas", value: String(values.people) }],
          };
        case "duration":
          return {
            stepKey: step.key,
            title: step.title,
            rows: [{ label: "Duração", value: `${values.hours}h` }],
          };
        case "consumption":
          return {
            stepKey: step.key,
            title: step.title,
            rows: [
              {
                label: "Perfil",
                value: getConsumptionProfile(values.consumptionProfile).label,
              },
            ],
          };
        case "otherDrinks":
          return {
            stepKey: step.key,
            title: step.title,
            rows: [
              {
                label: "Outras bebidas",
                value: values.otherDrinks ? "Sim" : "Não",
              },
            ],
          };
        case "flavors":
          if (steps.some((s) => s.key === "flavorDistribution")) return null;
          return {
            stepKey: step.key,
            title: "Sabores",
            rows: (values.flavors || []).map((f) => ({
              label: f.name,
              value: `${f.percent}% · ${formatCurrency(f.unitPrice)}/L`,
            })),
          };
        case "flavorDistribution":
          return {
            stepKey: step.key,
            title: "Sabores",
            rows: (values.flavors || []).map((f) => ({
              label: f.name,
              value: `${f.percent}% · ${formatCurrency(f.unitPrice)}/L`,
            })),
          };
        case "distance":
          return {
            stepKey: step.key,
            title: step.title,
            rows: [{ label: "Distância", value: `${values.distanceKm} km` }],
          };
        case "extras": {
          const labels =
            values.extras.length === 0
              ? [{ label: "Extras", value: "Nenhum" }]
              : values.extras.map((e) => ({
                  label: "Extra",
                  value: getExtraDefinition(e.extraId)?.label || e.extraId,
                }));
          return { stepKey: step.key, title: step.title, rows: labels };
        }
        case "client":
          return {
            stepKey: step.key,
            title: step.title,
            rows: [
              { label: "Nome", value: values.clientName || "—" },
              { label: "Telefone", value: values.clientPhone || "—" },
              { label: "Cidade", value: values.clientCity || "—" },
              {
                label: "Data do evento",
                value: formatDateBR(values.eventDate),
              },
              {
                label: "Observações",
                value: values.notes?.trim() || "—",
              },
            ],
          };
        default:
          return null;
      }
    })
    .filter((g): g is ReviewGroup => g !== null);
}

export default function StepReview({
  values,
  steps,
  onEditStep,
  isEditing = false,
  result,
  serviceType,
  negotiatedTotal,
  adjustmentReason,
  onNegotiatedChange,
  onReasonChange,
  correctedLiters,
  onCorrectedLitersChange,
  disabled,
}: StepReviewProps) {
  // Sections only after explicit pencil; remount on return to review resets this
  const [showSections, setShowSections] = useState(false);
  const groups = buildGroups(values, steps);

  const handlePickSection = (key: BudgetStepKey) => {
    setShowSections(false);
    onEditStep(key);
  };

  return (
    <div className="space-y-4">
      {isEditing ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {showSections
              ? "Escolha a seção para editar."
              : "Memória de cálculo. Use o lápis para alterar uma seção."}
          </p>
          <button
            type="button"
            onClick={() => setShowSections((v) => !v)}
            disabled={disabled}
            className="shrink-0 rounded-md p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-50"
            aria-label={
              showSections ? "Fechar seções" : "Editar seções do orçamento"
            }
            aria-pressed={showSections}
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Confira o cálculo. Volte para editar ou salve a proposta.
        </p>
      )}

      {isEditing && showSections
        ? groups.map((group) => (
            <div
              key={`${group.stepKey}-${group.title}`}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {group.title}
                </h4>
                <button
                  type="button"
                  onClick={() => handlePickSection(group.stepKey)}
                  disabled={disabled}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1 disabled:opacity-50"
                  aria-label={`Editar ${group.title}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <dl className="space-y-1.5">
                {group.rows.map((row, idx) => (
                  <div
                    key={`${row.label}-${idx}`}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <dt className="text-gray-500 dark:text-gray-400">
                      {row.label}
                    </dt>
                    <dd className="text-gray-900 dark:text-white font-medium text-right">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))
        : null}

      <BudgetPreview
        result={result}
        serviceType={serviceType}
        negotiatedTotal={negotiatedTotal}
        adjustmentReason={adjustmentReason}
        onNegotiatedChange={onNegotiatedChange}
        onReasonChange={onReasonChange}
        correctedLiters={correctedLiters}
        onCorrectedLitersChange={onCorrectedLitersChange}
        allowLiterCorrection
        disabled={disabled}
      />
    </div>
  );
}
