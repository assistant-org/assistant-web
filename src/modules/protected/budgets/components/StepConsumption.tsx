import React from "react";
import { CONSUMPTION_PROFILES } from "../../../../shared/services/budgets/budget.config";
import { ConsumptionProfileId } from "../../../../shared/services/budgets/types";

interface StepConsumptionProps {
  value: ConsumptionProfileId;
  onChange: (value: ConsumptionProfileId) => void;
  disabled?: boolean;
}

export default function StepConsumption({
  value,
  onChange,
  disabled,
}: StepConsumptionProps) {
  return (
    <div className="grid gap-3">
      {CONSUMPTION_PROFILES.map((profile) => {
        const selected = value === profile.id;
        return (
          <button
            key={profile.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(profile.id)}
            className={`text-left rounded-2xl border-2 p-4 transition-all duration-200 flex items-center justify-between ${
              selected
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 shadow-md"
                : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 bg-white dark:bg-gray-800"
            }`}
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {profile.label}
                {profile.isDefault ? (
                  <span className="ml-2 text-xs font-medium text-indigo-600">
                    Padrão
                  </span>
                ) : null}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {profile.litersPerPersonPerHour} L / pessoa / hora
              </p>
            </div>
            {selected ? (
              <span className="text-indigo-600 text-xl">✓</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
