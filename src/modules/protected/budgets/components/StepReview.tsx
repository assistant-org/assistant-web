import React from "react";
import { Pencil } from "lucide-react";
import {
  getConsumptionProfile,
  getExtraDefinition,
  getServiceTypeConfig,
} from "../../../../shared/services/budgets/budget.config";
import { formatCurrency, formatLiters } from "../../../../shared/services/budgets/format";
import { BudgetFormValues } from "../../../../shared/services/budgets/schema";
import { BudgetCalculationResult } from "../../../../shared/services/budgets/types";
import { formatDateBR } from "../../../../shared/utils/formatDate";
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
  /** Section pencils only in edit mode. */
  isEditing?: boolean;
  result: BudgetCalculationResult | null;
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
        case "review":
        case "orderReview":
          return null;
        default:
          return null;
      }
    })
    .filter((g): g is ReviewGroup => g !== null);
}

function billingLiters(result: BudgetCalculationResult | null): number {
  if (!result) return 0;
  if (result.wasLitersAdjusted && result.correctedLiters != null) {
    return result.correctedLiters;
  }
  return result.suppliedLiters ?? result.requiredLiters ?? result.totalLiters ?? 0;
}

export default function StepReview({
  values,
  steps,
  onEditStep,
  isEditing = false,
  result,
  disabled,
}: StepReviewProps) {
  const groups = buildGroups(values, steps);
  const total =
    values.negotiatedTotal != null && Number.isFinite(values.negotiatedTotal)
      ? values.negotiatedTotal
      : result?.finalTotal;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {isEditing
          ? "Escolha a seção para editar ou salve as alterações."
          : "Confira o resumo do pedido antes de salvar."}
      </p>

      {groups.map((group) => (
        <div
          key={`${group.stepKey}-${group.title}`}
          className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {group.title}
            </h4>
            {isEditing ? (
              <button
                type="button"
                onClick={() => onEditStep(group.stepKey)}
                disabled={disabled}
                className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1 disabled:opacity-50"
                aria-label={`Editar ${group.title}`}
              >
                <Pencil className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          <dl className="space-y-1.5">
            {group.rows.map((row, idx) => (
              <div
                key={`${row.label}-${idx}`}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <dt className="text-gray-500 dark:text-gray-400">{row.label}</dt>
                <dd className="text-gray-900 dark:text-white font-medium text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      {result ? (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/30 p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Litros contratados
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatLiters(billingLiters(result))}
            </span>
          </div>
          {total != null ? (
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Total
              </span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(total)}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
