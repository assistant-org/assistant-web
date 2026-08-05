import React from "react";
import { Pencil } from "lucide-react";
import {
  TransactionType,
  PAYMENT_METHOD_LABELS,
} from "../../../../../shared/services/transactions/types";
import { formatDateBR } from "../../../../../shared/utils/formatDate";
import { StepDefinition, StepKey } from "./steps";
import { TransactionFormValues } from "../../types";

const TYPE_LABELS: Record<string, string> = {
  [TransactionType.INCOME]: "Receita",
  [TransactionType.EXPENSE]: "Despesa",
};

function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ReviewRow {
  label: string;
  value: string;
}

interface ReviewGroup {
  stepKey: StepKey;
  title: string;
  rows: ReviewRow[];
}

interface StepReviewProps {
  values: TransactionFormValues;
  type: TransactionType;
  steps: StepDefinition[];
  eventsEnabled: boolean;
  onEditStep: (key: StepKey) => void;
  resolveCategoryName: (id?: string | null) => string;
  resolveEventName: (id?: string | null) => string | null;
}

export default function StepReview({
  values,
  type,
  steps,
  eventsEnabled,
  onEditStep,
  resolveCategoryName,
  resolveEventName,
}: StepReviewProps) {
  const groups: ReviewGroup[] = steps
    .map((step): ReviewGroup | null => {
      switch (step.key) {
        case "type":
          return {
            stepKey: step.key,
            title: "Tipo",
            rows: [{ label: "Tipo", value: TYPE_LABELS[type] || type }],
          };
        case "incomeExpenseDetails": {
          const rows: ReviewRow[] = [
            { label: "Data", value: formatDateBR(values.date) },
            { label: "Valor", value: formatCurrency(values.value) },
            { label: "Categoria", value: resolveCategoryName(values.categoryId) },
          ];
          return { stepKey: step.key, title: "Dados da movimentação", rows };
        }
        case "incomeExpenseExtras": {
          const rows: ReviewRow[] = [
            {
              label: "Forma de Pagamento",
              value: values.paymentMethod
                ? PAYMENT_METHOD_LABELS[values.paymentMethod] || values.paymentMethod
                : "-",
            },
          ];
          if (eventsEnabled) {
            rows.push({ label: "Evento", value: resolveEventName(values.eventId) || "-" });
          }
          rows.push({ label: "Descrição", value: values.description || "-" });
          return { stepKey: step.key, title: "Detalhes adicionais", rows };
        }
        default:
          return null;
      }
    })
    .filter((g): g is ReviewGroup => g !== null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Confira os dados antes de salvar. Clique no lápis para corrigir qualquer informação.
      </p>
      {groups.map((group) => (
        <div
          key={group.stepKey}
          className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{group.title}</h4>
            <button
              type="button"
              onClick={() => onEditStep(group.stepKey)}
              className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 dark:hover:text-white p-1 -m-1"
              aria-label={`Editar ${group.title}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <dl className="space-y-1.5">
            {group.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{row.label}</dt>
                <dd className="text-gray-900 dark:text-white font-medium text-right">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
