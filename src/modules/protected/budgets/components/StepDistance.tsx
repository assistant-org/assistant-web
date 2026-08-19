import React, { useEffect, useState } from "react";
import {
  DISTANCE_MAX,
  DISTANCE_MIN,
  DISTANCE_STEP,
  getServiceTypeConfig,
} from "../../../../shared/services/budgets/budget.config";
import { formatCurrency } from "../../../../shared/services/budgets/format";
import { BudgetServiceType } from "../../../../shared/services/budgets/types";

interface StepDistanceProps {
  value: number;
  serviceType: BudgetServiceType;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function StepDistance({
  value,
  serviceType,
  onChange,
  disabled,
}: StepDistanceProps) {
  const rate = getServiceTypeConfig(serviceType).distanceRatePerKm;
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft.replace(",", "."));
    const clamped = Number.isFinite(parsed)
      ? Math.min(DISTANCE_MAX, Math.max(DISTANCE_MIN, Math.round(parsed)))
      : DISTANCE_MIN;
    setDraft(String(clamped));
    onChange(clamped);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <div className="inline-flex items-baseline justify-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            aria-label="Distância em quilômetros"
            className="w-24 text-center text-5xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums bg-transparent border-0 border-b border-indigo-200/70 dark:border-indigo-500/40 focus:border-indigo-500 focus:ring-0 outline-none px-1 py-0.5"
          />
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            km
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Taxa: {formatCurrency(rate)}/km
        </p>
      </div>
      <input
        type="range"
        min={DISTANCE_MIN}
        max={DISTANCE_MAX}
        step={DISTANCE_STEP}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{DISTANCE_MIN} km</span>
        
        <span>{DISTANCE_MAX} km</span>
      </div>
    </div>
  );
}
