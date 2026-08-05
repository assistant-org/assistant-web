import React from "react";
import { Pencil } from "lucide-react";
import { StockMovementType } from "../../../../../shared/services/stock/types";
import { StockFormValues } from "../../schema";
import { StockStepDefinition, StockStepKey } from "./steps";

const TYPE_LABELS: Record<string, string> = {
  [StockMovementType.ENTRY]: "Entrada",
  [StockMovementType.EXIT]: "Saída",
  [StockMovementType.LOSS]: "Perda",
  [StockMovementType.INTERNAL_CONSUMPTION]: "Consumo Interno",
};

function formatCurrency(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date?: string | null): string {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("pt-BR");
}

interface StepReviewProps {
  values: StockFormValues;
  type: StockMovementType;
  steps: StockStepDefinition[];
  onEditStep: (key: StockStepKey) => void;
  resolveProductName: (id?: string | null) => string;
  resolveBatchLabel: (id?: string | null) => string;
}

export default function StepReview({
  values,
  type,
  steps,
  onEditStep,
  resolveProductName,
  resolveBatchLabel,
}: StepReviewProps) {
  const groups = steps
    .map((step) => {
      switch (step.key) {
        case "type":
          return {
            stepKey: step.key,
            title: "Tipo",
            rows: [{ label: "Tipo", value: TYPE_LABELS[type] || type }],
          };
        case "entryDetails":
          return {
            stepKey: step.key,
            title: "Produto e quantidade",
            rows: [
              { label: "Produto", value: resolveProductName(values.productId) },
              {
                label: "Quantidade",
                value: `${(values.quantity ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} L`,
              },
              { label: "Valor por litro", value: formatCurrency(values.unitValue) },
              {
                label: "Valor total",
                value: formatCurrency((values.quantity ?? 0) * (values.unitValue ?? 0)),
              },
            ],
          };
        case "entryMeta":
          return {
            stepKey: step.key,
            title: "Datas e descrição",
            rows: [
              { label: "Data da compra", value: formatDate(values.entryDate) },
              { label: "Validade", value: formatDate(values.expiryDate) },
              { label: "Descrição", value: values.observations || "-" },
            ],
          };
        case "outgoingDetails":
          return {
            stepKey: step.key,
            title: "Produto e lote",
            rows: [
              { label: "Produto", value: resolveProductName(values.productId) },
              { label: "Lote", value: resolveBatchLabel(values.batchId) },
              {
                label: "Quantidade",
                value: `${(values.quantity ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} L`,
              },
            ],
          };
        case "outgoingMeta":
          return {
            stepKey: step.key,
            title: "Data e descrição",
            rows: [
              { label: "Data", value: formatDate(values.date) },
              { label: "Descrição", value: values.reason || "-" },
            ],
          };
        default:
          return null;
      }
    })
    .filter(Boolean) as {
    stepKey: StockStepKey;
    title: string;
    rows: { label: string; value: string }[];
  }[];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Confira os dados antes de salvar. Use o lápis para corrigir.
      </p>
      {groups.map((group) => (
        <div
          key={group.stepKey}
          className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {group.title}
            </h4>
            <button
              type="button"
              onClick={() => onEditStep(group.stepKey)}
              className="text-indigo-600 hover:text-indigo-800 dark:text-zinc-400 p-1"
              aria-label={`Editar ${group.title}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <dl className="space-y-1.5">
            {group.rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{row.label}</dt>
                <dd className="text-gray-900 dark:text-white font-medium text-right">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
