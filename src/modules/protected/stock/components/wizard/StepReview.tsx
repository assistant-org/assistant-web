import React from "react";
import { Pencil } from "lucide-react";
import { StockMovementType } from "../../../../../shared/services/stock/types";
import { formatDateBR } from "../../../../../shared/utils/formatDate";
import {
  movementRequiresEvent,
  movementRequiresJustification,
} from "../../../../../shared/services/stock/schema";
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

interface StepReviewProps {
  values: StockFormValues;
  type: StockMovementType;
  steps: StockStepDefinition[];
  onEditStep: (key: StockStepKey) => void;
  resolveProductName: (id?: string | null) => string;
  resolveBatchLabel: (id?: string | null) => string;
  resolveEventName: (id?: string | null) => string;
}

export default function StepReview({
  values,
  type,
  steps,
  onEditStep,
  resolveProductName,
  resolveBatchLabel,
  resolveEventName,
}: StepReviewProps) {
  const isEntry = type === StockMovementType.ENTRY;
  const showEvent =
    movementRequiresEvent(type) ||
    Boolean(values.eventId && String(values.eventId).trim());
  const showJustification = movementRequiresJustification(type);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tipo</h3>
          <button type="button" onClick={() => onEditStep("type")} className="text-indigo-600 p-1">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {TYPE_LABELS[type] || type}
          {" · "}
          {values.mode === "lote" ? "Em lote" : "Individual"}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Itens</h3>
          <button
            type="button"
            onClick={() => onEditStep("operation")}
            className="text-indigo-600 p-1"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        {showEvent ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Evento: {resolveEventName(values.eventId)}
          </p>
        ) : null}
        <ul className="space-y-2">
          {(values.items || []).map((item, i) => (
            <li
              key={i}
              className="text-sm text-gray-800 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700 pt-2 first:border-0 first:pt-0"
            >
              <span className="font-medium">{resolveProductName(item.productId)}</span>
              {!isEntry && (
                <span className="text-gray-500"> · {resolveBatchLabel(item.batchId)}</span>
              )}
              <span>
                {" · "}
                {item.quantity?.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} L
              </span>
              {isEntry && (
                <span className="text-gray-500">
                  {" · "}
                  {formatCurrency(item.unitValue)}/L
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {isEntry ? "Datas" : "Data"}
          </h3>
          <button type="button" onClick={() => onEditStep("meta")} className="text-indigo-600 p-1">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        {isEntry ? (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Entrada: {formatDateBR(values.entryDate)}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Validade: {formatDateBR(values.expiryDate)}
            </p>
            {values.observations && (
              <p className="text-sm text-gray-500 mt-1">{values.observations}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Data: {formatDateBR(values.date)}
            </p>
            {showJustification && values.reason ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                <span className="font-medium">Justificativa:</span> {values.reason}
              </p>
            ) : null}
            {!showJustification && values.reason ? (
              <p className="text-sm text-gray-500 mt-1">{values.reason}</p>
            ) : null}
          </>
        )}
      </div>

      {/* keep steps prop referenced to avoid unused lint */}
      <span className="hidden">{steps.length}</span>
    </div>
  );
}
