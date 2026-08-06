import React, { useMemo } from "react";
import { beerDistribution } from "../../../../shared/services/budgets/BeerDistributionService";
import { BudgetFormValues } from "../../../../shared/services/budgets/schema";

interface StepFlavorDistributionProps {
  value: BudgetFormValues["flavors"];
  onChange: (flavors: BudgetFormValues["flavors"]) => void;
  disabled?: boolean;
}

export default function StepFlavorDistribution({
  value,
  onChange,
  disabled,
}: StepFlavorDistributionProps) {
  const validation = useMemo(
    () => beerDistribution.validatePercents(value),
    [value],
  );

  const setPercent = (productId: string, percent: number) => {
    const next = Math.max(0, Math.min(100, Math.round(percent)));
    onChange(
      value.map((f) =>
        f.productId === productId ? { ...f, percent: next } : f,
      ),
    );
  };

  const bump = (productId: string, delta: number) => {
    const current = value.find((f) => f.productId === productId)?.percent ?? 0;
    setPercent(productId, current + delta);
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">Distribuição</p>
        <p
          className={`text-3xl font-bold tabular-nums ${
            validation.ok
              ? "text-emerald-600 dark:text-emerald-400"
              : validation.total > 100
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {validation.total}%
        </p>
        {validation.ok ? (
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Completa
          </p>
        ) : (
          <p className="text-sm text-red-500 dark:text-red-400">
            {validation.error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {value.map((flavor) => (
          <div
            key={flavor.productId}
            className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2"
          >
            <p className="font-medium text-gray-900 dark:text-white">
              {flavor.name}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={disabled || flavor.percent <= 0}
                onClick={() => bump(flavor.productId, -5)}
                className="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-600 text-lg font-bold disabled:opacity-40"
                aria-label={`Diminuir ${flavor.name}`}
              >
                −
              </button>
              <div className="flex items-baseline gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={disabled}
                  value={flavor.percent}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setPercent(flavor.productId, raw === "" ? 0 : Number(raw));
                  }}
                  className="w-16 text-center text-2xl font-bold tabular-nums bg-transparent border-0 border-b border-indigo-200/70 dark:border-indigo-500/40 focus:border-indigo-500 outline-none"
                  aria-label={`Porcentagem ${flavor.name}`}
                />
                <span className="text-lg text-gray-500">%</span>
              </div>
              <button
                type="button"
                disabled={disabled || flavor.percent >= 100}
                onClick={() => bump(flavor.productId, 5)}
                className="h-10 w-10 rounded-lg border border-gray-300 dark:border-gray-600 text-lg font-bold disabled:opacity-40"
                aria-label={`Aumentar ${flavor.name}`}
              >
                +
              </button>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-200"
                style={{ width: `${Math.min(100, flavor.percent)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
