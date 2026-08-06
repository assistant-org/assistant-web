import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import MoneyInput from "../../../../shared/components/MoneyInput";
import { getServiceTypeConfig } from "../../../../shared/services/budgets/budget.config";
import {
  formatCurrency,
  formatLiters,
} from "../../../../shared/services/budgets/format";
import {
  BudgetCalculationResult,
  BudgetServiceType,
} from "../../../../shared/services/budgets/types";
import CorrectLitersModal from "./CorrectLitersModal";

interface BudgetPreviewProps {
  result: BudgetCalculationResult | null;
  serviceType: BudgetServiceType;
  negotiatedTotal: number | null | undefined;
  adjustmentReason: string | null | undefined;
  onNegotiatedChange: (value: number | null) => void;
  onReasonChange: (value: string) => void;
  correctedLiters?: number | null;
  onCorrectedLitersChange?: (value: number | null) => void;
  /** When true, show pencil to edit liters (review step). */
  allowLiterCorrection?: boolean;
  disabled?: boolean;
}

function Section({
  title,
  children,
  internal,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  internal?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <section className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </h4>
        {internal ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            interno
          </span>
        ) : null}
        {actions ? <div className="ml-auto flex items-center gap-1">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function BudgetPreview({
  result,
  serviceType,
  negotiatedTotal,
  adjustmentReason,
  onNegotiatedChange,
  onReasonChange,
  correctedLiters: correctedLitersProp,
  onCorrectedLitersChange,
  allowLiterCorrection = false,
  disabled,
}: BudgetPreviewProps) {
  const [isCorrectOpen, setIsCorrectOpen] = useState(false);

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-sm text-gray-500 text-center">
        Preencha os passos para ver o cálculo em tempo real.
      </div>
    );
  }

  const serviceLabel = getServiceTypeConfig(serviceType).label;
  const requiredLiters = result.requiredLiters ?? result.totalLiters;
  const suppliedLiters = result.suppliedLiters ?? requiredLiters;
  const technicalReserve =
    result.technicalReserve ?? Math.max(0, suppliedLiters - requiredLiters);
  const kegPlan = result.kegPlan ?? [];
  const correctedLiters =
    result.correctedLiters ?? correctedLitersProp ?? null;
  const wasLitersAdjusted = Boolean(
    result.wasLitersAdjusted ?? (correctedLiters != null && correctedLiters > 0),
  );

  const muted = wasLitersAdjusted
    ? "text-sm text-gray-400 dark:text-gray-500 font-mono"
    : "text-sm text-gray-800 dark:text-gray-200 font-mono";

  const canEditLiters =
    allowLiterCorrection && Boolean(onCorrectedLitersChange) && !disabled;

  const modalInitialLiters = correctedLiters ?? suppliedLiters;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Memória de cálculo
      </h3>

      <Section title="Pessoas">
        <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
          {result.people} × {result.hours}h × {result.litersPerPersonPerHour}
          {result.otherDrinksFactor < 1
            ? ` × ${result.otherDrinksFactor} (outras bebidas)`
            : ""}{" "}
          = <strong>{formatLiters(requiredLiters)}</strong>
        </p>
      </Section>

      <Section
        title="Fornecimento (barris)"
        internal
        actions={
          canEditLiters ? (
            <button
              type="button"
              onClick={() => setIsCorrectOpen(true)}
              className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              aria-label="Corrigir quantidade de chopp"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null
        }
      >
        <p className={`${muted} mb-2`}>
          Quantidade necessária:{" "}
          {wasLitersAdjusted ? (
            formatLiters(requiredLiters)
          ) : (
            <strong>{formatLiters(requiredLiters)}</strong>
          )}
        </p>
        <p
          className={`text-xs font-medium mb-1 ${
            wasLitersAdjusted
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-500"
          }`}
        >
          Sugestão de fornecimento
        </p>
        <ul className="space-y-1 mb-2">
          {kegPlan.length ? (
            kegPlan.map((keg) => (
              <li key={keg.size} className={muted}>
                • {keg.count}× Barril {keg.size}L
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500">—</li>
          )}
        </ul>
        <p className={muted}>
          Total fornecido:{" "}
          {wasLitersAdjusted ? (
            formatLiters(suppliedLiters)
          ) : (
            <strong>{formatLiters(suppliedLiters)}</strong>
          )}
        </p>
        <p className={muted}>
          Reserva técnica:{" "}
          {wasLitersAdjusted ? (
            formatLiters(technicalReserve)
          ) : (
            <strong>{formatLiters(technicalReserve)}</strong>
          )}
        </p>

        {wasLitersAdjusted && correctedLiters != null ? (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2">
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              Total Corrigido: {formatLiters(correctedLiters)}
            </p>
            {canEditLiters ? (
              <button
                type="button"
                onClick={() => onCorrectedLitersChange?.(null)}
                className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                aria-label="Remover correção de litros"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : null}
      </Section>

      <Section title="Sabores">
        <ul className="space-y-2">
          {result.flavorLines.map((line) => (
            <li
              key={line.productId}
              className="text-sm text-gray-800 dark:text-gray-200 font-mono"
            >
              {line.name} ({line.percent ?? "—"}%): {formatLiters(line.liters)}{" "}
              × {formatCurrency(line.unitPrice)} ={" "}
              <strong>{formatCurrency(line.subtotal)}</strong>
            </li>
          ))}
          {!result.flavorLines.length ? (
            <li className="text-sm text-gray-500">Nenhum sabor selecionado</li>
          ) : null}
        </ul>
      </Section>

      <Section title="Deslocamento" internal>
        <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
          {result.distanceKm} km × {formatCurrency(result.distanceRate)} ={" "}
          <strong>{formatCurrency(result.distanceCost)}</strong>
        </p>
      </Section>

      <Section title="Custos operacionais" internal>
        <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
          {serviceLabel}: {result.operational.detail} ={" "}
          <strong>{formatCurrency(result.operational.amount)}</strong>
        </p>
      </Section>

      {result.extraLines.length > 0 ? (
        <Section title="Extras">
          <ul className="space-y-2">
            {result.extraLines.map((line) => (
              <li
                key={line.extraId}
                className="text-sm text-gray-800 dark:text-gray-200 font-mono"
              >
                {line.label}: <strong>{formatCurrency(line.amount)}</strong>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Total calculado">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(result.calculatedTotal)}
        </p>
      </Section>

      <Section title="Valor da proposta">
        <p className="text-xs text-gray-500 mb-2">
          Altere se houver desconto ou negociação. O cálculo original permanece
          salvo.
        </p>
        <MoneyInput
          label="Valor final"
          value={
            negotiatedTotal != null ? negotiatedTotal : result.calculatedTotal
          }
          onChange={(v) => onNegotiatedChange(v)}
          disabled={disabled}
        />
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Motivo (opcional)
          </label>
          <input
            type="text"
            value={adjustmentReason || ""}
            disabled={disabled}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Desconto comercial, negociação…"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm"
          />
        </div>
        <p className="mt-3 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
          Proposta: {formatCurrency(result.finalTotal)}
        </p>
      </Section>

      {canEditLiters ? (
        <CorrectLitersModal
          isOpen={isCorrectOpen}
          initialLiters={modalInitialLiters}
          onClose={() => setIsCorrectOpen(false)}
          onSave={(liters) => onCorrectedLitersChange?.(liters)}
        />
      ) : null}
    </div>
  );
}
